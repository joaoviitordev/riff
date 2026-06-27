"use client";

import { useTopMusicas } from "@/hooks/queries/use-top-musicas";
import { formatDuracao } from "@/lib/format/format-duracao";
import { IconMusic } from "@tabler/icons-react";

interface ListaTopMusicasProps {
  userId: string;
  periodo: string;
}

export default function ListaTopMusicas({ userId, periodo }: ListaTopMusicasProps) {
  const { data: tracks, isLoading, error } = useTopMusicas(userId, periodo);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-[#1B1B1B] border border-border rounded-xl animate-pulse">
            <div className="w-6 h-6 bg-[#252525] rounded shrink-0"></div>
            <div className="w-12 h-12 bg-[#252525] rounded shrink-0"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-[#252525] rounded w-1/3"></div>
              <div className="h-3 bg-[#252525] rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-[#252525] rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !tracks || tracks.length === 0) {
    return (
      <div className="flex flex-col gap-3 text-center py-16 px-4 bg-[#1B1B1B]/40 border border-border/50 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-[#1B1B1B] border border-border flex items-center justify-center mx-auto text-riff-gray">
          <IconMusic size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mt-2">Nenhuma música encontrada</h3>
        <p className="text-riff-gray text-base max-w-[400px] mx-auto leading-relaxed">
          Nenhuma música mais ouvida registrada para este período no Spotify.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {tracks.slice(0, 5).map((track, index) => (
        <a
          key={track.id}
          href={track.external_urls?.spotify || "https://open.spotify.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-[#1B1B1B] hover:bg-[#252525] border border-border hover:border-riff-orange/30 rounded-xl transition-all duration-200 group"
        >
          <span className="text-lg font-bold text-riff-gray group-hover:text-riff-orange transition-colors w-6 text-center">
            {index + 1}
          </span>

          <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-border/50">
            {track.album.images?.[0]?.url ? (
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#252525] flex items-center justify-center">
                <IconMusic className="text-riff-gray" size={20} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col text-left">
            <span className="text-white font-semibold text-base truncate group-hover:text-riff-orange transition-colors">
              {track.name}
            </span>
            <span className="text-riff-gray text-sm truncate">
              {track.artists?.map((a) => a.name).join(", ") || "Artista desconhecido"}
            </span>
          </div>

          <span className="text-sm text-riff-gray shrink-0 font-medium">
            {formatDuracao(track.duration_ms)}
          </span>
        </a>
      ))}
    </div>
  );
}
