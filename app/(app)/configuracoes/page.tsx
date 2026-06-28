import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ConfiguracoesForm from "./configuracoes-form";

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser) {
    redirect("/login");
  }

  const initialData = {
    id: dbUser.id,
    name: dbUser.name || "",
    username: dbUser.username || "",
    bio: dbUser.bio || "",
    avatarUrl: dbUser.avatarUrl || null,
    bannerUrl: dbUser.bannerUrl || null,
  };

  return <ConfiguracoesForm initialData={initialData} />;
}
