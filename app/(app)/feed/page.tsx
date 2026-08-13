import type { Metadata } from "next";
import ListaFeed from "@/components/dominio/feed/lista-feed";

export const metadata: Metadata = {
  title: "Início",
  description: "Veja o que as pessoas que você segue estão ouvindo agora.",
};

export default function FeedPage() {
  return (
    <main className="mx-auto flex w-full max-w-[800px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Ouvindo agora
        </h1>
        <p className="text-sm text-riff-gray">
          O que as pessoas que você segue estão ouvindo neste momento.
        </p>
      </header>

      <ListaFeed />
    </main>
  );
}
