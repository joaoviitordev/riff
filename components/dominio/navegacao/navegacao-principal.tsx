"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconHome,
  IconHomeFilled,
  IconSearch,
  IconUser,
  IconLogin,
} from "@tabler/icons-react";
import MarcaRiff from "@/components/marca-riff";
import ItemNavegacao from "./item-navegacao";

interface UsuarioNavegacao {
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface NavegacaoPrincipalProps {
  usuario: UsuarioNavegacao | null;
}

export default function NavegacaoPrincipal({
  usuario,
}: NavegacaoPrincipalProps) {
  const pathname = usePathname();
  const [visivel, setVisivel] = useState(true);
  const ultimaPosicao = useRef(0);

  useEffect(() => {
    function aoRolar() {
      const posicao = window.scrollY;
      const diferenca = posicao - ultimaPosicao.current;

      if (posicao < 80) {
        setVisivel(true);
      } else if (diferenca > 8) {
        setVisivel(false);
      } else if (diferenca < -8) {
        setVisivel(true);
      }

      ultimaPosicao.current = posicao;
    }

    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const perfilHref = usuario ? `/${usuario.username}` : "/login";

  const itens = [
    {
      href: "/feed",
      label: "Início",
      icone: IconHome,
      iconeAtivo: IconHomeFilled,
      ativo: pathname === "/feed",
      avatarUrl: undefined,
    },
    {
      href: "/buscar",
      label: "Buscar",
      icone: IconSearch,
      iconeAtivo: undefined,
      ativo: pathname === "/buscar",
      avatarUrl: undefined,
    },
    usuario
      ? {
          href: perfilHref,
          label: "Perfil",
          icone: IconUser,
          iconeAtivo: undefined,
          ativo: pathname === perfilHref || pathname === "/configuracoes",
          avatarUrl: usuario.avatarUrl,
        }
      : {
          href: "/login",
          label: "Entrar",
          icone: IconLogin,
          iconeAtivo: undefined,
          ativo: false,
          avatarUrl: undefined,
        },
  ];

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#131313] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 md:hidden ${
          visivel ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-stretch gap-1 px-2 py-1">
          {itens.map((item) => (
            <ItemNavegacao key={item.label} {...item} orientacao="vertical" />
          ))}
        </div>
      </nav>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-8 border-r border-border bg-[#131313] px-4 py-8 md:flex"
      >
        <Link href="/feed" aria-label="Riff, ir para o início" className="px-4">
          <MarcaRiff className="text-3xl" />
        </Link>

        <div className="flex flex-col gap-2">
          {itens.map((item) => (
            <ItemNavegacao key={item.label} {...item} orientacao="horizontal" />
          ))}
        </div>
      </nav>
    </>
  );
}
