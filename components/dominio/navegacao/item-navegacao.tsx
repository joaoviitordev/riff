"use client";

import Link from "next/link";
import Image from "next/image";
import type { TablerIcon } from "@tabler/icons-react";

interface ItemNavegacaoProps {
  href: string;
  label: string;
  ativo: boolean;
  icone: TablerIcon;
  iconeAtivo?: TablerIcon;
  avatarUrl?: string | null;
  orientacao: "vertical" | "horizontal";
}

export default function ItemNavegacao({
  href,
  label,
  ativo,
  icone: Icone,
  iconeAtivo: IconeAtivo,
  avatarUrl,
  orientacao,
}: ItemNavegacaoProps) {
  const IconeExibido = ativo && IconeAtivo ? IconeAtivo : Icone;
  const ehVertical = orientacao === "vertical";

  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={`flex min-h-[56px] items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riff-orange ${
        ehVertical
          ? "flex-1 flex-col rounded-xl py-2"
          : "w-full flex-row gap-4 rounded-full px-4 py-3 hover:bg-surface-bright"
      } ${ativo ? "text-riff-orange" : "text-riff-gray hover:text-white"}`}
    >
      {avatarUrl !== undefined ? (
        <span
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#131313] ${
            ehVertical ? "h-7 w-7" : "h-8 w-8"
          } ${ativo ? "ring-2 ring-riff-orange" : "ring-1 ring-border"}`}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <IconeExibido size={ehVertical ? 18 : 20} />
          )}
        </span>
      ) : (
        <IconeExibido size={ehVertical ? 26 : 24} stroke={ativo ? 2.2 : 1.8} />
      )}

      <span
        className={
          ehVertical
            ? "text-[11px] font-semibold leading-none"
            : "text-base font-semibold"
        }
      >
        {label}
      </span>
    </Link>
  );
}
