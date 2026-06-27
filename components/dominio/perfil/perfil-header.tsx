"use client";

import { IconEdit, IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BotaoSeguir from "./botao-seguir";

interface UserPublicInfo {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  followersCount: number;
  followingCount: number;
}

interface PerfilHeaderProps {
  user: UserPublicInfo;
  isOwnProfile: boolean;
  initialIsFollowing: boolean;
  currentUsername: string | null;
}

export default function PerfilHeader({
  user,
  isOwnProfile,
  initialIsFollowing,
  currentUsername,
}: PerfilHeaderProps) {
  return (
    <div className="w-full flex flex-col relative bg-[#131313]">
      {/* Banner / Capa */}
      <div className="w-full h-48 md:h-64 relative overflow-hidden bg-linear-to-r from-riff-orange/40 via-surface-low to-surface-bright border-b border-border">
        {user.bannerUrl && (
          <img
            src={user.bannerUrl}
            alt="Capa do perfil"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Seção de Informações (Foto, Detalhes e Ações) */}
      <div className="max-w-[800px] w-full mx-auto px-6 relative pb-6">
        {/* Foto de perfil (Avatar) */}
        <div className="absolute -top-16 left-6 md:-top-20">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || `@${user.username}`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#131313] bg-[#1B1B1B] object-cover shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#131313] bg-[#1B1B1B] flex items-center justify-center shadow-xl">
              <span className="text-4xl text-riff-gray font-bold">
                {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Botões de Ação (Alinhado à direita da foto de perfil) */}
        <div className="flex justify-end pt-4 pb-2 min-h-[70px]">
          {isOwnProfile ? (
            <Link href="/configuracoes" className="block">
              <Button
                variant="outline"
                className="h-14 px-6 border-border bg-[#1B1B1B] hover:bg-surface-bright text-white font-semibold rounded-full flex items-center gap-2 cursor-pointer text-base"
              >
                <IconEdit size={20} />
                Editar perfil
              </Button>
            </Link>
          ) : currentUsername ? (
            <BotaoSeguir
              targetUserId={user.id}
              targetUsername={user.username}
              currentUsername={currentUsername}
              initialIsFollowing={initialIsFollowing}
            />
          ) : (
            <Button
              disabled
              className="h-14 px-8 bg-riff-orange hover:bg-[#e6501a] text-white font-semibold rounded-full flex items-center gap-2 cursor-pointer text-base disabled:bg-riff-gray/50 disabled:cursor-not-allowed"
            >
              <IconUserPlus size={20} />
              Seguir
            </Button>
          )}
        </div>

        {/* Dados Textuais */}
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {user.name || user.username}
            </h1>
            <p className="text-riff-orange font-semibold text-lg">
              @{user.username}
            </p>
          </div>

          {user.bio && (
            <p className="text-riff-light-gray text-base leading-relaxed max-w-[600px]">
              {user.bio}
            </p>
          )}

          {/* Contadores Sociais */}
          <div className="flex gap-6 mt-2 text-sm md:text-base text-riff-gray">
            <span className="flex gap-1.5 items-center">
              <strong className="text-white font-bold">{user.followersCount}</strong> seguidores
            </span>
            <span className="flex gap-1.5 items-center">
              <strong className="text-white font-bold">{user.followingCount}</strong> seguindo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
