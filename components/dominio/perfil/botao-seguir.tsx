"use client";

import { useSeguir } from "@/hooks/mutations/use-seguir";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconUserPlus, IconUserCheck } from "@tabler/icons-react";

interface BotaoSeguirProps {
  targetUserId: string;
  targetUsername: string;
  currentUsername: string;
  initialIsFollowing: boolean;
}

export default function BotaoSeguir({
  targetUserId,
  targetUsername,
  currentUsername,
  initialIsFollowing,
}: BotaoSeguirProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { seguir, isSeguindoLoading, deixarDeSeguir, isDeixarDeSeguirLoading } = useSeguir(
    targetUsername,
    currentUsername
  );

  const isLoading = isSeguindoLoading || isDeixarDeSeguirLoading;

  const handleToggleFollow = () => {
    if (isFollowing) {
      deixarDeSeguir(targetUserId, {
        onSuccess: () => setIsFollowing(false),
      });
    } else {
      seguir(targetUserId, {
        onSuccess: () => setIsFollowing(true),
      });
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`h-14 px-8 font-semibold rounded-full flex items-center gap-2 cursor-pointer text-base transition-all duration-200 ${
        isFollowing
          ? "border border-border bg-[#1B1B1B] hover:bg-surface-bright text-white"
          : "bg-riff-orange hover:bg-[#e6501a] text-white"
      }`}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : isFollowing ? (
        <>
          <IconUserCheck size={20} />
          Seguindo
        </>
      ) : (
        <>
          <IconUserPlus size={20} />
          Seguir
        </>
      )}
    </Button>
  );
}
