"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

const deixarDeSeguirSchema = z.object({
  usuarioId: z.string().uuid(),
});

export const deixarDeSeguirUsuario = authActionClient
  .schema(deixarDeSeguirSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { usuarioId: followingId } = parsedInput;
    const followerId = ctx.session.user.id;

    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ),
    });

    if (!existingFollow) {
      return { success: true };
    }

    // Executa em transação (Padrão P1 - Cascata)
    await db.transaction(async (tx) => {
      // 1. Remove a relação de follow
      await tx
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, followerId),
            eq(follows.followingId, followingId)
          )
        );

      // 2. Decrementa a contagem de seguidores de quem foi seguido
      await tx
        .update(users)
        .set({
          followersCount: sql`GREATEST(${users.followersCount} - 1, 0)`,
        })
        .where(eq(users.id, followingId));

      // 3. Decrementa a contagem de quem está seguindo
      await tx
        .update(users)
        .set({
          followingCount: sql`GREATEST(${users.followingCount} - 1, 0)`,
        })
        .where(eq(users.id, followerId));
    });

    return { success: true };
  });
