import Link from "next/link";
import Image from "next/image";
import { IconMusic } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import type { ItemFeed as ItemFeedDados } from "@/types/feed";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface ItemFeedProps {
  item: ItemFeedDados;
}

export default function ItemFeed({ item }: ItemFeedProps) {
  const inicial = (item.name || item.username)[0]?.toUpperCase() ?? "?";
  const ouvindo = item.ouvindo;
  const estaTocando = !!ouvindo?.isPlaying && !!ouvindo.trackName;
  const temUltimaMusica = !!ouvindo?.trackName;

  const legenda = !item.temSpotify
    ? "Ainda não conectou o Spotify"
    : estaTocando
      ? "Ouvindo agora"
      : temUltimaMusica
        ? `Última música ouvida • ${dayjs(ouvindo.updatedAt).fromNow()}`
        : "Sem atividade recente";

  return (
    <Link
      href={`/${item.username}`}
      className={`flex min-h-[88px] items-center gap-4 rounded-2xl border bg-[#1B1B1B] px-4 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riff-orange ${
        estaTocando
          ? "border-riff-spotify/20 hover:border-riff-spotify/40"
          : "border-border hover:bg-surface-bright"
      }`}
    >
      <div
        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#131313] ${
          estaTocando ? "ring-2 ring-riff-spotify ring-offset-2 ring-offset-[#1B1B1B]" : "border border-border"
        }`}
      >
        {item.avatarUrl ? (
          <Image
            src={item.avatarUrl}
            alt={item.name || `@${item.username}`}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xl font-bold text-riff-gray">{inicial}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-white">
          {item.name || item.username}
        </span>
        <span
          className={`truncate text-xs font-semibold uppercase tracking-wider ${
            estaTocando ? "text-riff-spotify" : "text-riff-gray"
          }`}
        >
          {legenda}
        </span>
        {temUltimaMusica && (
          <span className="mt-0.5 truncate text-sm text-riff-light-gray">
            {ouvindo.trackName}
            {ouvindo.artist ? ` • ${ouvindo.artist}` : ""}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div
          className={`relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-[#131313] ${
            estaTocando ? "" : "opacity-70 grayscale-30"
          }`}
        >
          {ouvindo?.albumArt ? (
            <Image
              src={ouvindo.albumArt}
              alt={ouvindo.trackName || "Capa do álbum"}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <IconMusic size={20} className="text-riff-gray" aria-hidden="true" />
            </div>
          )}
        </div>

        {estaTocando && (
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-riff-spotify opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-riff-spotify" />
          </span>
        )}
      </div>
    </Link>
  );
}
