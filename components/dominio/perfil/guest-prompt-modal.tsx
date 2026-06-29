"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuestPromptModalProps {
  username: string;
}

export default function GuestPromptModal({ username }: GuestPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show the modal once per session
    const hasSeenPrompt = sessionStorage.getItem("hasSeenGuestPrompt");
    if (hasSeenPrompt) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      sessionStorage.setItem("hasSeenGuestPrompt", "true");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-border text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Conecte com o Spotify</DialogTitle>
          <DialogDescription className="text-riff-gray text-base mt-2">
            Quer acompanhar o que <strong className="text-white">@{username}</strong> e seus amigos estão ouvindo agora? Crie sua conta no Riff para interagir e compartilhar suas próprias descobertas!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto border-border text-white hover:bg-[#2a2a2a] hover:text-white"
          >
            Agora não
          </Button>
          <Link href="/login" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)}>
            <Button className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold">
              Conectar com Spotify
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
