import { useQuery } from "@tanstack/react-query";
import type { ItemFeed } from "@/types/feed";

export const FEED_KEY = ["feed"];

export function useFeed() {
  return useQuery<ItemFeed[]>({
    queryKey: FEED_KEY,
    queryFn: async () => {
      const resposta = await fetch("/api/feed");

      if (!resposta.ok) {
        throw new Error("Não conseguimos carregar o que seus amigos estão ouvindo.");
      }

      return resposta.json();
    },
    refetchInterval: 30000,
  });
}
