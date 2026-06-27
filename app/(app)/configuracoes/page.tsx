import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ConfiguracoesForm from "./configuracoes-form";

export default async function ConfiguracoesPage() {
  const session = await auth();

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
  };

  return <ConfiguracoesForm initialData={initialData} />;
}
