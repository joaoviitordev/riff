import { useQuery } from "@tanstack/react-query";

export interface NowPlayingData {
  userId: string;
  trackId: string | null;
  trackName: string | null;
  artist: string | null;
  albumArt: string | null;
  isPlaying: boolean;
  updatedAt: string;
}

export const NOW_PLAYING_KEY = (username: string) => ["now-playing", username];

export function useNowPlaying(username: string) {
  return useQuery<NowPlayingData | null>({
    queryKey: NOW_PLAYING_KEY(username),
    queryFn: async () => {
      const response = await fetch(`/api/now-playing/${username}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar status de reprodução.");
      }
      return response.json();
    },
    refetchInterval: 30000, // Polling a cada 30 segundos (Regra CLAUDE.md)
    enabled: !!username,
  });
}
