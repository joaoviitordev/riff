import { useQuery } from "@tanstack/react-query";
import type { SpotifyArtist } from "@/types/spotify";

export const TOP_ARTISTAS_KEY = (userId: string, periodo: string) => ["top-artistas", userId, periodo];

export function useTopArtistas(userId: string, periodo: string) {
  return useQuery<SpotifyArtist[]>({
    queryKey: TOP_ARTISTAS_KEY(userId, periodo),
    queryFn: async () => {
      const response = await fetch(`/api/spotify/top-artists?userId=${userId}&periodo=${periodo}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar artistas favoritos.");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}
