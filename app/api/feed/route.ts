import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { atualizarNowPlaying } from "@/lib/now-playing";
import { aplicarRateLimit } from "@/lib/rate-limit";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import type { ItemFeed } from "@/types/feed";

export async function GET(request: NextRequest) {
  const limite = await aplicarRateLimit("feed", request);
  if (limite) return limite;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Você precisa estar conectado para ver o feed." },
      { status: 401 }
    );
  }

  const seguidos = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatarUrl: users.avatarUrl,
      spotifyId: users.spotifyId,
    })
    .from(follows)
    .innerJoin(users, eq(users.id, follows.followingId))
    .where(
      and(
        eq(follows.followerId, session.user.id),
        isNull(users.deletedAt),
        isNotNull(users.username)
      )
    );

  const itens: ItemFeed[] = await Promise.all(
    seguidos.map(async (pessoa) => {
      const ouvindo = pessoa.spotifyId
        ? await atualizarNowPlaying(pessoa.id)
        : null;

      return {
        id: pessoa.id,
        username: pessoa.username as string,
        name: pessoa.name,
        avatarUrl: pessoa.avatarUrl,
        temSpotify: !!pessoa.spotifyId,
        ouvindo: ouvindo
          ? {
              trackName: ouvindo.trackName,
              artist: ouvindo.artist,
              albumArt: ouvindo.albumArt,
              isPlaying: ouvindo.isPlaying,
              updatedAt: ouvindo.updatedAt.toISOString(),
            }
          : null,
      };
    })
  );

  itens.sort((primeiro, segundo) => {
    const tocandoPrimeiro = primeiro.ouvindo?.isPlaying ? 1 : 0;
    const tocandoSegundo = segundo.ouvindo?.isPlaying ? 1 : 0;

    if (tocandoPrimeiro !== tocandoSegundo) {
      return tocandoSegundo - tocandoPrimeiro;
    }

    const momentoPrimeiro = primeiro.ouvindo
      ? new Date(primeiro.ouvindo.updatedAt).getTime()
      : 0;
    const momentoSegundo = segundo.ouvindo
      ? new Date(segundo.ouvindo.updatedAt).getTime()
      : 0;

    return momentoSegundo - momentoPrimeiro;
  });

  return NextResponse.json(itens);
}
