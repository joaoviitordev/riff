import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

if (!redis) {
  console.warn(
    "Upstash Redis não configurado. O rate limiting está desativado localmente."
  );
}

type TipoLimite = "now-playing" | "metricas";

function criarLimitador(prefixo: string, limite: number): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limite, "1 m"),
    prefix: prefixo,
  });
}

const limitadores: Record<TipoLimite, Ratelimit | null> = {
  "now-playing": criarLimitador("ratelimit:now-playing", 20),
  metricas: criarLimitador("ratelimit:metricas", 30),
};

function extrairIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export async function aplicarRateLimit(
  tipo: TipoLimite,
  request: Request
): Promise<NextResponse | null> {
  const limitador = limitadores[tipo];
  if (!limitador) return null;

  const ip = extrairIp(request);
  const { success, reset } = await limitador.limit(ip);

  if (success) return null;

  const segundos = Math.max(0, Math.ceil((reset - Date.now()) / 1000));

  return NextResponse.json(
    {
      error:
        "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(segundos) },
    }
  );
}
