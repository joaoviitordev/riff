"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { IconSearch, IconUsersGroup } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useFeed, FEED_KEY } from "@/hooks/queries/use-feed";
import type { ItemFeed as ItemFeedDados } from "@/types/feed";
import ItemFeed from "./item-feed";

interface LinhaNowPlaying {
  user_id: string;
  track_name: string | null;
  artist: string | null;
  album_art: string | null;
  is_playing: boolean;
  updated_at: string;
}

export default function ListaFeed() {
  const queryClient = useQueryClient();
  const { data: itens, isLoading, isError } = useFeed();

  useEffect(() => {
    const canal = supabase
      .channel("feed:now-playing")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "now_playing" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            return;
          }

          const linha = payload.new as LinhaNowPlaying;

          queryClient.setQueryData<ItemFeedDados[]>(FEED_KEY, (atual) => {
            if (!atual?.some((item) => item.id === linha.user_id)) {
              return atual;
            }

            return atual.map((item) =>
              item.id === linha.user_id
                ? {
                    ...item,
                    ouvindo: {
                      trackName: linha.track_name,
                      artist: linha.artist,
                      albumArt: linha.album_art,
                      isPlaying: linha.is_playing,
                      updatedAt: linha.updated_at,
                    },
                  }
                : item
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((posicao) => (
          <div
            key={posicao}
            className="flex min-h-[88px] animate-pulse items-center gap-4 rounded-2xl border border-border bg-[#1B1B1B] px-4 py-4"
          >
            <div className="h-14 w-14 shrink-0 rounded-full bg-[#252525]" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-32 rounded bg-[#252525]" />
              <div className="h-3 w-24 rounded bg-[#252525]" />
              <div className="h-3 w-44 rounded bg-[#252525]" />
            </div>
            <div className="h-12 w-12 shrink-0 rounded-lg bg-[#252525]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-[#1B1B1B] px-6 py-12 text-center">
        <p className="text-lg font-semibold text-white">
          Não conseguimos carregar seu feed
        </p>
        <p className="max-w-[320px] text-sm text-riff-gray">
          Verifique sua conexão. A gente tenta de novo em instantes.
        </p>
      </div>
    );
  }

  if (!itens?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-[#1B1B1B] px-6 py-12 text-center">
        <IconUsersGroup size={40} className="text-riff-gray" aria-hidden="true" />
        <p className="text-lg font-semibold text-white">
          Você ainda não segue ninguém
        </p>
        <p className="max-w-[340px] text-sm text-riff-gray">
          Encontre pessoas para acompanhar o que elas estão ouvindo em tempo real
          aqui.
        </p>
        <Link href="/buscar" className="mt-2">
          <Button className="flex h-14 cursor-pointer items-center gap-2 rounded-full bg-riff-orange px-8 text-base font-semibold text-white hover:bg-[#e6501a]">
            <IconSearch size={20} />
            Buscar pessoas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {itens.map((item) => (
        <ItemFeed key={item.id} item={item} />
      ))}
    </div>
  );
}
