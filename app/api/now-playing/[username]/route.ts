import { NextRequest, NextResponse } from "next/server";
import { atualizarNowPlaying } from "@/lib/now-playing";
import { aplicarRateLimit } from "@/lib/rate-limit";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

interface RouteProps {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const limite = await aplicarRateLimit("now-playing", request);
  if (limite) return limite;

  const { username } = await params;

  if (!username) {
    return NextResponse.json({ error: "Username é obrigatório." }, { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id, spotifyId: users.spotifyId })
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (!user.spotifyId) {
    return NextResponse.json(null);
  }

  try {
    const registro = await atualizarNowPlaying(user.id);
    return NextResponse.json(registro);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar status do player." }, { status: 500 });
  }
}
