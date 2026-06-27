"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

const seguirSchema = z.object({
  usuarioId: z.string().uuid(),
});

export const seguirUsuario = authActionClient
  .schema(seguirSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { usuarioId: followingId } = parsedInput;
    const followerId = ctx.session.user.id;

    if (followerId === followingId) {
      throw new Error("Você não pode seguir a si mesmo.");
    }

    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, followingId),
    });

    if (!targetUser || targetUser.deletedAt) {
      throw new Error("O usuário que você deseja seguir não existe.");
    }

    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ),
    });

    if (existingFollow) {
      return { success: true };
    }

    // Executa em transação (Padrão P1 - Cascata)
    await db.transaction(async (tx) => {
      // 1. Cria a relação de follow
      await tx.insert(follows).values({
        followerId,
        followingId,
      });

      // 2. Incrementa a contagem de seguidores de quem foi seguido
      await tx
        .update(users)
        .set({
          followersCount: sql`${users.followersCount} + 1`,
        })
        .where(eq(users.id, followingId));

      // 3. Incrementa a contagem de quem está seguindo
      await tx
        .update(users)
        .set({
          followingCount: sql`${users.followingCount} + 1`,
        })
        .where(eq(users.id, followerId));
    });

    return { success: true };
  });
