"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull, ne } from "drizzle-orm";

const salvarPerfilSchema = z.object({
  username: z
    .string()
    .min(3, "O @nome precisa ter pelo menos 3 caracteres.")
    .max(30, "O @nome pode ter no máximo 30 caracteres.")
    .regex(/^[a-z0-9_]+$/, "Só letras minúsculas, números e _ são permitidos."),
  name: z
    .string()
    .min(1, "O nome não pode ficar vazio.")
    .max(50, "O nome pode ter no máximo 50 caracteres."),
  bio: z
    .string()
    .max(160, "A bio pode ter no máximo 160 caracteres.")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable(),
});

export const salvarPerfil = authActionClient
  .schema(salvarPerfilSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { username, name, bio, avatarUrl } = parsedInput;
    const userId = ctx.session.user.id;

    // 1. Validar no servidor se o username já está em uso por outro usuário
    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.username, username),
        isNull(users.deletedAt),
        ne(users.id, userId)
      ),
    });

    if (existingUser) {
      throw new Error("Esse @nome de usuário já está em uso. Escolha outro.");
    }

    // 2. Atualizar o usuário no banco de dados
    await db
      .update(users)
      .set({
        username,
        name,
        bio: bio || null,
        avatarUrl: avatarUrl || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      username,
    };
  });
