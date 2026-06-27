"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull, ne } from "drizzle-orm";

const verificarUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "O @nome precisa ter pelo menos 3 caracteres.")
    .max(30, "O @nome pode ter no máximo 30 caracteres.")
    .regex(/^[a-z0-9_]+$/, "Só letras minúsculas, números e _ são permitidos."),
});

export const verificarUsername = authActionClient
  .schema(verificarUsernameSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { username } = parsedInput;
    const currentUserId = ctx.session.user.id;

    // Procura por outro usuário que já tenha esse username (não excluído)
    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.username, username),
        isNull(users.deletedAt),
        ne(users.id, currentUserId)
      ),
    });

    return {
      disponivel: !existingUser,
    };
  });
