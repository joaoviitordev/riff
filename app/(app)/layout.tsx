import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import NavegacaoPrincipal from "@/components/dominio/navegacao/navegacao-principal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  let usuario: {
    username: string;
    name: string | null;
    avatarUrl: string | null;
  } | null = null;

  if (session?.user?.id) {
    const [atual] = await db
      .select({
        username: users.username,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(and(eq(users.id, session.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (atual?.username) {
      usuario = { ...atual, username: atual.username };
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#131313]">
      <NavegacaoPrincipal usuario={usuario} />
      <div className="flex flex-1 flex-col pb-24 md:pb-0 md:pl-60">
        {children}
      </div>
    </div>
  );
}
