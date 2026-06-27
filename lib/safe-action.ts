import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/auth";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }
    return "Ocorreu um erro inesperado. Tente novamente.";
  }
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Você precisa estar conectado para realizar esta ação.");
  }
  
  return next({
    ctx: {
      session: session as {
        user: {
          id: string;
          username: string | null;
          spotifyId: string;
        };
      }
    }
  });
});
