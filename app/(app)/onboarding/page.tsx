import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Se já tiver username, redireciona para a home
  if (session.user.username) {
    redirect("/");
  }

  // Busca dados mais recentes do usuário logado no banco de dados
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser) {
    redirect("/login");
  }

  const initialData = {
    name: dbUser.name || "",
    avatarUrl: dbUser.avatarUrl || null,
  };

  return <OnboardingForm initialData={initialData} />;
}
