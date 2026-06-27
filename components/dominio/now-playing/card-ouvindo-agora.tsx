"use client";

import { IconMusic } from "@tabler/icons-react";

interface CardOuvindoAgoraProps {
  trackName?: string | null;
  artist?: string | null;
  albumArt?: string | null;
  isPlaying?: boolean;
}

export default function CardOuvindoAgora({
  trackName = null,
  artist = null,
  albumArt = null,
  isPlaying = false,
}: CardOuvindoAgoraProps) {
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
