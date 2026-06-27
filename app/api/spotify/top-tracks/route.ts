import { NextRequest, NextResponse } from "next/server";
import { getSpotifyTopTracks } from "@/lib/spotify";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const periodo = searchParams.get("periodo");

  if (!userId) {
    return NextResponse.json({ error: "O campo userId é obrigatório." }, { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  let timeRange = "short_term";
  if (periodo === "ultimos-6-meses") {
    timeRange = "medium_term";
  } else if (periodo === "todo-tempo") {
    timeRange = "long_term";
  }

  try {
    const tracks = await getSpotifyTopTracks(userId, timeRange);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar músicas favoritas." }, { status: 500 });
  }
}
