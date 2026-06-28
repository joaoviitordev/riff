import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PerfilHeader from "@/components/dominio/perfil/perfil-header";
import CardOuvindoAgora from "@/components/dominio/now-playing/card-ouvindo-agora";
import SeletorPeriodo from "@/components/dominio/metricas/seletor-periodo";
import ListaTopMusicas from "@/components/dominio/metricas/lista-top-musicas";
import ListaTopArtistas from "@/components/dominio/metricas/lista-top-artistas";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ aba?: string; periodo?: string }>;
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
  const { aba, periodo } = await searchParams;

  const [userPublico] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      bannerUrl: users.bannerUrl,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
    })
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  if (!userPublico || !userPublico.username) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === userPublico.id;

  // Verifica se o usuário logado segue o perfil visitado
  let initialIsFollowing = false;
  if (session?.user?.id && !isOwnProfile) {
    const followRecord = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, userPublico.id)
      ),
    });
    initialIsFollowing = !!followRecord;
  }

  const abaAtiva = aba === "artistas" ? "artistas" : "musicas";
  const periodoAtivo = periodo === "ultimos-6-meses" || periodo === "todo-tempo" ? periodo : "ultimo-mes";

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-[#131313] pb-12">
      {/* Cabeçalho do Perfil */}
      <PerfilHeader
        user={{ ...userPublico, username: userPublico.username }}
        isOwnProfile={isOwnProfile}
        initialIsFollowing={initialIsFollowing}
        currentUsername={session?.user?.username || null}
      />

      {/* Container de Conteúdo */}
      <main className="max-w-[800px] w-full mx-auto px-6 mt-6 flex flex-col gap-8">
        {/* Card Ouvindo Agora */}
        <section aria-label="Status atual">
          <CardOuvindoAgora username={userPublico.username} userId={userPublico.id} />
        </section>

        {/* Abas de Navegação (P-006: Estado refletido na URL) */}
        <section className="flex flex-col gap-6" aria-label="Estatísticas musicais">
          <div className="flex flex-col gap-4 w-full">
            {/* Linha das Abas */}
            <div className="flex border-b border-border w-full">
              <Link
                href={`/${userPublico.username}?aba=musicas&periodo=${periodoAtivo}`}
                className={`pb-3 px-6 text-lg font-semibold border-b-2 transition-all cursor-pointer mb-[-2px] ${
                  abaAtiva === "musicas"
                    ? "border-riff-orange text-white"
                    : "border-transparent text-riff-gray hover:text-white"
                }`}
              >
                Músicas
              </Link>
              <Link
                href={`/${userPublico.username}?aba=artistas&periodo=${periodoAtivo}`}
                className={`pb-3 px-6 text-lg font-semibold border-b-2 transition-all cursor-pointer mb-[-2px] ${
                  abaAtiva === "artistas"
                    ? "border-riff-orange text-white"
                    : "border-transparent text-riff-gray hover:text-white"
                }`}
              >
                Artistas
              </Link>
            </div>

            {/* Seletor de Período */}
            <div className="flex justify-start items-center">
              <SeletorPeriodo />
            </div>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="w-full min-h-[300px]">
            {abaAtiva === "musicas" ? (
              <ListaTopMusicas userId={userPublico.id} periodo={periodoAtivo} />
            ) : (
              <ListaTopArtistas userId={userPublico.id} periodo={periodoAtivo} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
