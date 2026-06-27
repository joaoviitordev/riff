import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SpotifyCurrentlyPlaying, SpotifyTrack, SpotifyArtist } from "@/types/spotify";

export async function getAccessTokenValido(userId: string): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Usuário não encontrado.");

  const expirado = new Date() >= new Date(user.tokenExpiresAt);
  if (!expirado) return user.accessToken;

  const resposta = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: user.refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    }),
  });

  if (!resposta.ok) {
    throw new Error("Erro ao renovar o token do Spotify.");
  }

  const dados = await resposta.json();

  await db
    .update(users)
    .set({
      accessToken: dados.access_token,
      refreshToken: dados.refresh_token || user.refreshToken,
      tokenExpiresAt: new Date(Date.now() + dados.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return dados.access_token;
}

export async function getSpotifyTopTracks(userId: string, timeRange: string): Promise<SpotifyTrack[]> {
  const token = await getAccessTokenValido(userId);
  const resposta = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=${timeRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resposta.ok) {
    return [];
  }

  const dados = await resposta.json();
  return (dados.items as SpotifyTrack[]) || [];
}

export async function getSpotifyTopArtists(userId: string, timeRange: string): Promise<SpotifyArtist[]> {
  const token = await getAccessTokenValido(userId);
  const resposta = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=5&time_range=${timeRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resposta.ok) {
    return [];
  }

  const dados = await resposta.json();
  return (dados.items as SpotifyArtist[]) || [];
}

export async function getSpotifyCurrentlyPlaying(userId: string): Promise<SpotifyCurrentlyPlaying | null> {
  const token = await getAccessTokenValido(userId);
  const resposta = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (resposta.status === 204 || resposta.status > 300) {
    return null;
  }

  try {
    const dados = await resposta.json();
    return dados as SpotifyCurrentlyPlaying;
  } catch {
    return null;
  }
}
