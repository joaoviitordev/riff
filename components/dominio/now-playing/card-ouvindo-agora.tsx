"use client";

import { useNowPlayingRealtime } from "@/hooks/use-now-playing-realtime";
import { IconMusic } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface CardOuvindoAgoraProps {
  username: string;
  userId: string;
}

export default function CardOuvindoAgora({ username, userId }: CardOuvindoAgoraProps) {
  const { data: np, isLoading } = useNowPlayingRealtime(username, userId);

  // 1. Estado de Carregamento (Loading Skeleton)
  if (isLoading) {
    return (
      <div className="w-full bg-[#1B1B1B] border border-border rounded-2xl p-6 flex items-center justify-between shadow-lg animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-[#252525] shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-[#252525] rounded w-20" />
            <div className="h-5 bg-[#252525] rounded w-36" />
            <div className="h-4 bg-[#252525] rounded w-28" />
          </div>
        </div>
        <div className="w-3.5 h-3.5 rounded-full bg-[#252525]" />
      </div>
    );
  }

  // 2. Estado de Erro ou Sem Atividade Recente (Offline)
  if (!np || (!np.isPlaying && !np.trackName)) {
    return (
      <div className="w-full bg-[#1B1B1B] border border-border rounded-2xl p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-[#252525] border border-border flex items-center justify-center shrink-0">
            <IconMusic className="text-riff-gray" size={28} />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-riff-gray uppercase tracking-wider">
              Ouvindo agora
            </span>
            <span className="text-white font-semibold text-lg mt-0.5">
              Sem atividade recente
            </span>
            <span className="text-sm text-riff-gray">
              Conectado com o Spotify
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-riff-gray/30"></span>
        </div>
      </div>
    );
  }

  // 3. Estado: Tocando no Momento (isPlaying: true)
  if (np.isPlaying && np.trackName) {
    return (
      <div className="w-full bg-[#1B1B1B] border border-riff-spotify/20 hover:border-riff-spotify/40 rounded-2xl p-6 flex items-center justify-between shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-riff-spotify/30 relative">
            {np.albumArt ? (
              <img
                src={np.albumArt}
                alt={np.trackName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#252525] flex items-center justify-center">
                <IconMusic className="text-riff-gray" size={28} />
              </div>
            )}
          </div>

          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-semibold text-riff-spotify uppercase tracking-wider flex items-center gap-1.5">
              Ouvindo agora
            </span>
            <span className="text-white font-bold text-lg mt-0.5 truncate pr-2">
              {np.trackName}
            </span>
            <span className="text-riff-light-gray text-sm truncate pr-2">
              por {np.artist || "Artista desconhecido"}
            </span>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-riff-spotify opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-riff-spotify"></span>
          </span>
        </div>
      </div>
    );
  }

  // 4. Estado: Pausado / Última Música Ouvida
  const tempoDecorrido = dayjs(np.updatedAt).fromNow();
  return (
    <div className="w-full bg-[#1B1B1B] border border-border rounded-2xl p-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border opacity-70">
          {np.albumArt ? (
            <img
              src={np.albumArt}
              alt={np.trackName || "Capa do álbum"}
              className="w-full h-full object-cover grayscale-30"
            />
          ) : (
            <div className="w-full h-full bg-[#252525] flex items-center justify-center">
              <IconMusic className="text-riff-gray" size={28} />
            </div>
          )}
        </div>

        <div className="flex flex-col text-left min-w-0">
          <span className="text-xs font-semibold text-riff-gray uppercase tracking-wider">
            Última música ouvida
          </span>
          <span className="text-white font-semibold text-lg mt-0.5 truncate pr-2">
            {np.trackName}
          </span>
          <span className="text-riff-gray text-sm truncate pr-2">
            por {np.artist || "Artista desconhecido"} • {tempoDecorrido}
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <span className="w-3 h-3 rounded-full bg-riff-gray/30"></span>
      </div>
    </div>
  );
}
