"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBuscarUsuarios } from "@/hooks/queries/use-buscar-usuarios";

export default function BuscaUsuarios() {
  const [termo, setTermo] = useState("");
  const [termoDebounced, setTermoDebounced] = useState("");
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce da busca (300ms) — filtragem proativa (P-004)
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermoDebounced(termo);
    }, 300);

    return () => clearTimeout(handler);
  }, [termo]);

  // Fecha os resultados ao clicar fora do campo
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const { data: usuarios, isFetching } = useBuscarUsuarios(termoDebounced);

  const termoValido = termoDebounced.trim().length >= 2;
  const mostrarResultados = aberto && termoValido;
  const semResultados =
    !isFetching && termoValido && (usuarios?.length ?? 0) === 0;

  function limpar() {
    setTermo("");
    setTermoDebounced("");
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-riff-gray pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder="Buscar pessoas no Riff"
          aria-label="Buscar pessoas no Riff"
          className="h-14 w-full rounded-full bg-[#1B1B1B] border-border text-white pl-12 pr-12 text-base focus-visible:ring-riff-orange placeholder:text-riff-gray"
        />
        {termo.length > 0 && (
          <button
            type="button"
            onClick={limpar}
            aria-label="Limpar busca"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-riff-gray hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {mostrarResultados && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-[#1B1B1B] shadow-xl overflow-hidden">
          {isFetching && (
            <p className="px-4 py-4 text-sm text-riff-gray">Buscando...</p>
          )}

          {semResultados && (
            <p className="px-4 py-4 text-sm text-riff-gray">
              Ninguém encontrado para “{termoDebounced.trim()}”.
            </p>
          )}

          {!isFetching &&
            usuarios?.map((usuario) => (
              <Link
                key={usuario.id}
                href={`/${usuario.username}`}
                onClick={limpar}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-bright transition-colors"
              >
                <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-[#131313]">
                  {usuario.avatarUrl ? (
                    <Image
                      src={usuario.avatarUrl}
                      alt={usuario.name || `@${usuario.username}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-lg font-bold text-riff-gray">
                        {(usuario.name || usuario.username || "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-semibold truncate">
                    {usuario.name || usuario.username}
                  </span>
                  <span className="text-riff-orange text-sm truncate">
                    @{usuario.username}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
