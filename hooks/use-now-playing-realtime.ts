import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { NowPlayingData } from "@/hooks/queries/use-now-playing";

export function useNowPlayingRealtime(username: string, userId: string) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(() => (!userId || !username ? false : true));

  useEffect(() => {
    if (!userId || !username) {
      return;
    }

    let active = true;

    const fetchNowPlaying = async () => {
      try {
        const res = await fetch(`/api/now-playing/${username}`);
        if (res.ok && active) {
          const data = await res.json();
          setNowPlaying(data);
        }
      } catch (err) {
        console.error("Erro ao buscar status do player:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    // Assina as alterações no banco de dados para a tabela 'now_playing'
    const canal = supabase
      .channel(`now-playing:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "now_playing",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (!active) return;

          if (payload.eventType === "DELETE") {
            setNowPlaying(null);
          } else {
            // Mapeia o retorno em snake_case do PostgreSQL para o formato camelCase do Drizzle/Client
            const raw = payload.new as {
              user_id: string;
              track_id: string | null;
              track_name: string | null;
              artist: string | null;
              album_art: string | null;
              is_playing: boolean;
              updated_at: string;
            };

            setNowPlaying({
              userId: raw.user_id,
              trackId: raw.track_id,
              trackName: raw.track_name,
              artist: raw.artist,
              albumArt: raw.album_art,
              isPlaying: raw.is_playing,
              updatedAt: raw.updated_at,
            });
          }
        }
      )
      .subscribe();

    // Polling redundante a cada 30 segundos (conforme CLAUDE.md)
    const polling = setInterval(fetchNowPlaying, 30000);

    // Carregamento inicial
    fetchNowPlaying();

    return () => {
      active = false;
      supabase.removeChannel(canal);
      clearInterval(polling);
    };
  }, [username, userId]);

  return { data: nowPlaying, isLoading };
}
