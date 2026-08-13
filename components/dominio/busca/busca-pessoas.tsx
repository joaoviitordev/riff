"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconUsersGroup } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useBuscarUsuarios } from "@/hooks/queries/use-buscar-usuarios";
import ItemPessoa from "./item-pessoa";

interface BuscaPessoasProps {
  termoInicial: string;
}

export default function BuscaPessoas({ termoInicial }: BuscaPessoasProps) {
  const router = useRouter();
  const [termo, setTermo] = useState(termoInicial);
  const [termoDebounced, setTermoDebounced] = useState(termoInicial);

  useEffect(() => {
    const handler = setTimeout(() => setTermoDebounced(termo), 300);
    return () => clearTimeout(handler);
  }, [termo]);

  useEffect(() => {
    const limpo = termoDebounced.trim();
    const destino = limpo ? `/buscar?q=${encodeURIComponent(limpo)}` : "/buscar";
    router.replace(destino, { scroll: false });
  }, [termoDebounced, router]);

  const { data: pessoas, isFetching } = useBuscarUsuarios(termoDebounced);

  const termoValido = termoDebounced.trim().length >= 2;
  const semResultados = !isFetching && termoValido && (pessoas?.length ?? 0) === 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="relative">
        <IconSearch
          size={20}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-riff-gray"
        />
        <Input
          type="text"
          value={termo}
          autoFocus
          onChange={(evento) => setTermo(evento.target.value)}
          placeholder="Buscar pessoas no Riff"
          aria-label="Buscar pessoas no Riff"
          className="h-14 w-full rounded-full border-border bg-[#1B1B1B] pl-12 pr-12 text-base text-white placeholder:text-riff-gray focus-visible:ring-riff-orange"
        />
        {termo.length > 0 && (
          <button
            type="button"
            onClick={() => setTermo("")}
            aria-label="Limpar busca"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-riff-gray transition-colors hover:text-white"
          >
            <IconX size={20} />
          </button>
        )}
      </div>

      {!termoValido && (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <IconUsersGroup size={40} className="text-riff-gray" aria-hidden="true" />
          <p className="text-lg font-semibold text-white">
            Encontre gente com o seu gosto
          </p>
          <p className="max-w-[320px] text-sm text-riff-gray">
            Digite pelo menos 2 letras do nome ou do @nome de usuário de alguém.
          </p>
        </div>
      )}

      {termoValido && isFetching && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((posicao) => (
            <div key={posicao} className="flex animate-pulse items-center gap-4 px-4 py-3">
              <div className="h-14 w-14 shrink-0 rounded-full bg-[#1B1B1B]" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-36 rounded bg-[#1B1B1B]" />
                <div className="h-3 w-24 rounded bg-[#1B1B1B]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {semResultados && (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">
            Ninguém encontrado para “{termoDebounced.trim()}”
          </p>
          <p className="max-w-[320px] text-sm text-riff-gray">
            Confira a escrita ou tente buscar pelo @nome de usuário.
          </p>
        </div>
      )}

      {!isFetching && (pessoas?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-1">
          {pessoas?.map((pessoa) => (
            <ItemPessoa
              key={pessoa.id}
              username={pessoa.username}
              name={pessoa.name}
              avatarUrl={pessoa.avatarUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
