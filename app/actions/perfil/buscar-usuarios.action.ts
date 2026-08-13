"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, isNull, isNotNull, ne, or, ilike } from "drizzle-orm";

type UsuarioComUsername = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
};

const buscarUsuariosSchema = z.object({
  termo: z
    .string()
    .trim()
    .min(2, "Digite pelo menos 2 caracteres para buscar.")
    .max(30, "A busca pode ter no máximo 30 caracteres."),
});

export const buscarUsuarios = authActionClient
  .schema(buscarUsuariosSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { termo } = parsedInput;
    const currentUserId = ctx.session.user.id;
    const padrao = `%${termo}%`;

    const resultados = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          isNotNull(users.username),
          ne(users.id, currentUserId),
          or(ilike(users.username, padrao), ilike(users.name, padrao))
        )
      )
      .limit(8);

    const usuarios = resultados.filter(
      (usuario): usuario is UsuarioComUsername => usuario.username !== null
    );

    return { usuarios };
  });
