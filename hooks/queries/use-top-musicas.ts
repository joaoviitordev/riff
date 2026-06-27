import { useQuery } from "@tanstack/react-query";
import type { SpotifyTrack } from "@/types/spotify";

export const TOP_MUSICAS_KEY = (userId: string, periodo: string) => ["top-musicas", userId, periodo];

export function useTopMusicas(userId: string, periodo: string) {
  return useQuery<SpotifyTrack[]>({
    queryKey: TOP_MUSICAS_KEY(userId, periodo),
    queryFn: async () => {
      const response = await fetch(`/api/spotify/top-tracks?userId=${userId}&periodo=${periodo}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar músicas favoritas.");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}
