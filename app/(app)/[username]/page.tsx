import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconMusic, IconUser } from "@tabler/icons-react";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import PerfilHeader from "@/components/dominio/perfil/perfil-header";
import CardOuvindoAgora from "@/components/dominio/now-playing/card-ouvindo-agora";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ aba?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const [userPublico] = await db
    .select({
      username: users.username,
      name: users.name,
      bio: users.bio,
    })
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  if (!userPublico) {
    return {
      title: "Usuário não encontrado - Riff",
    };
  }

  const displayName = userPublico.name || `@${userPublico.username}`;

  return {
    title: `${displayName} - Riff`,
    description: userPublico.bio || `Confira o perfil musical de ${displayName} no Riff.`,
  };
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { aba } = await searchParams;

  const [userPublico] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      bannerUrl: users.bannerUrl,
    })
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  if (!userPublico || !userPublico.username) {
    notFound();
  }

  const session = await auth();
  const isOwnProfile = session?.user?.id === userPublico.id;

  const abaAtiva = aba === "artistas" ? "artistas" : "musicas";

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-[#131313] pb-12">
      {/* Cabeçalho do Perfil */}
      <PerfilHeader user={{ ...userPublico, username: userPublico.username }} isOwnProfile={isOwnProfile} />

      {/* Container de Conteúdo */}
      <main className="max-w-[800px] w-full mx-auto px-6 mt-6 flex flex-col gap-8">
        {/* Card Ouvindo Agora */}
        <section aria-label="Status atual">
          <CardOuvindoAgora />
        </section>

        {/* Abas de Navegação (P-006: Estado refletido na URL) */}
        <section className="flex flex-col gap-6" aria-label="Estatísticas musicais">
          <div className="flex border-b border-border w-full">
            <Link
              href={`/${userPublico.username}?aba=musicas`}
              className={`pb-4 px-6 text-lg font-semibold border-b-2 transition-all cursor-pointer ${
                abaAtiva === "musicas"
                  ? "border-riff-orange text-white"
                  : "border-transparent text-riff-gray hover:text-white"
              }`}
            >
              Músicas
            </Link>
            <Link
              href={`/${userPublico.username}?aba=artistas`}
              className={`pb-4 px-6 text-lg font-semibold border-b-2 transition-all cursor-pointer ${
                abaAtiva === "artistas"
                  ? "border-riff-orange text-white"
                  : "border-transparent text-riff-gray hover:text-white"
              }`}
            >
              Artistas
            </Link>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="w-full min-h-[300px]">
            {abaAtiva === "musicas" ? (
              <div className="flex flex-col gap-4 text-center py-16 px-4 bg-[#1B1B1B]/40 border border-border/50 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-[#1B1B1B] border border-border flex items-center justify-center mx-auto text-riff-gray">
                  <IconMusic size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mt-2">Músicas mais ouvidas</h3>
                <p className="text-riff-gray text-base max-w-[400px] mx-auto leading-relaxed">
                  As estatísticas de músicas favoritas do Spotify estarão disponíveis aqui na próxima fase.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-center py-16 px-4 bg-[#1B1B1B]/40 border border-border/50 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-[#1B1B1B] border border-border flex items-center justify-center mx-auto text-riff-gray">
                  <IconUser size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mt-2">Artistas favoritos</h3>
                <p className="text-riff-gray text-base max-w-[400px] mx-auto leading-relaxed">
                  As estatísticas de artistas favoritos do Spotify estarão disponíveis aqui na próxima fase.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
