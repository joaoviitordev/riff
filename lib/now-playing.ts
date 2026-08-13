import { db } from "@/db";
import { nowPlaying } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis";
import { getSpotifyCurrentlyPlaying } from "@/lib/spotify";

export type NowPlayingRegistro = typeof nowPlaying.$inferSelect;

const JANELA_ATUALIZACAO_SEGUNDOS = 25;

const reservasLocais = new Map<string, number>();

async function reservarConsultaSpotify(userId: string): Promise<boolean> {
  const chave = `now-playing:cooldown:${userId}`;

  if (redis) {
    const reservado = await redis.set(chave, "1", {
      nx: true,
      ex: JANELA_ATUALIZACAO_SEGUNDOS,
    });
    return reservado === "OK";
  }

  const agora = Date.now();
  const expiraEm = reservasLocais.get(userId);

  if (expiraEm && expiraEm > agora) {
    return false;
  }

  reservasLocais.set(userId, agora + JANELA_ATUALIZACAO_SEGUNDOS * 1000);
  return true;
}

async function gravarMusicaAtual(userId: string): Promise<void> {
  const tocandoAgora = await getSpotifyCurrentlyPlaying(userId);

  const musica =
    tocandoAgora?.currently_playing_type === "track" ? tocandoAgora.item : null;
  const estaTocando = !!tocandoAgora?.is_playing;

  if (!musica) {
    await db
      .insert(nowPlaying)
      .values({ userId, isPlaying: false, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: nowPlaying.userId,
        set: { isPlaying: false, updatedAt: new Date() },
      });
    return;
  }

  const dados = {
    trackId: musica.id,
    trackName: musica.name,
    artist: musica.artists.map((artista) => artista.name).join(", "),
    albumArt: musica.album.images?.[0]?.url || null,
    isPlaying: estaTocando,
    updatedAt: new Date(),
  };

  await db
    .insert(nowPlaying)
    .values({ userId, ...dados })
    .onConflictDoUpdate({ target: nowPlaying.userId, set: dados });
}

export async function atualizarNowPlaying(
  userId: string
): Promise<NowPlayingRegistro | null> {
  const podeConsultarSpotify = await reservarConsultaSpotify(userId);

  if (podeConsultarSpotify) {
    try {
      await gravarMusicaAtual(userId);
    } catch (error) {
      console.error(`Falha ao atualizar o que ${userId} está ouvindo:`, error);
    }
  }

  const registro = await db.query.nowPlaying.findFirst({
    where: eq(nowPlaying.userId, userId),
  });

  return registro ?? null;
}
