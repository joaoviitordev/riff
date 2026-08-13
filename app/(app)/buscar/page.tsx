import type { Metadata } from "next";
import BuscaPessoas from "@/components/dominio/busca/busca-pessoas";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Encontre pessoas no Riff e descubra o que elas estão ouvindo.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-[800px] flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">Buscar</h1>
      <BuscaPessoas termoInicial={q?.trim() ?? ""} />
    </main>
  );
}
