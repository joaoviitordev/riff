import { NextRequest, NextResponse } from "next/server";
import { getSpotifyCurrentlyPlaying } from "@/lib/spotify";
import { db } from "@/db";
import { users, nowPlaying } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

interface RouteProps {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { username } = await params;

  if (!username) {
    return NextResponse.json({ error: "Username é obrigatório." }, { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  try {
    const currentlyPlaying = await getSpotifyCurrentlyPlaying(user.id);

    if (currentlyPlaying && currentlyPlaying.item && currentlyPlaying.currently_playing_type === "track") {
      const track = currentlyPlaying.item;
      const artistNames = track.artists.map((a) => a.name).join(", ");
      const albumArtUrl = track.album.images?.[0]?.url || null;

      await db
        .insert(nowPlaying)
        .values({
          userId: user.id,
          trackId: track.id,
          trackName: track.name,
          artist: artistNames,
          albumArt: albumArtUrl,
          isPlaying: currentlyPlaying.is_playing,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: nowPlaying.userId,
          set: {
            trackId: track.id,
            trackName: track.name,
            artist: artistNames,
            albumArt: albumArtUrl,
            isPlaying: currentlyPlaying.is_playing,
            updatedAt: new Date(),
          },
        });
    } else {
      await db
        .insert(nowPlaying)
        .values({
          userId: user.id,
          isPlaying: false,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: nowPlaying.userId,
          set: {
            isPlaying: false,
            updatedAt: new Date(),
          },
        });
    }

    const currentNp = await db.query.nowPlaying.findFirst({
      where: eq(nowPlaying.userId, user.id),
    });

    return NextResponse.json(currentNp || null);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar status do player." }, { status: 500 });
  }
}
