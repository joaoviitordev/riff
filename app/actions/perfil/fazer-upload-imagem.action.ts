"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "avatars";

// Criamos um client admin usando a SERVICE_ROLE_KEY para contornar RLS de forma segura no backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const TIPOS_MIME_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const LIMITE_AVATAR_BYTES = 2 * 1024 * 1024;
const LIMITE_BANNER_BYTES = 4 * 1024 * 1024;

const uploadImagemSchema = z.object({
  tipo: z.enum(["avatar", "banner"]),
});

function detectarMimeReal(buffer: Uint8Array): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

function extrairExtensao(mimeType: string): string {
  const mapa: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mapa[mimeType] || "jpg";
}

function extrairPathDoBucket(url: string): string | null {
  const marcador = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const indice = url.indexOf(marcador);
  if (indice === -1) return null;
  return url.substring(indice + marcador.length);
}

export const fazerUploadImagem = authActionClient
  .schema(uploadImagemSchema)
  .action(async ({ parsedInput, ctx }) => {
    throw new Error(
      "Esta action deve ser chamada via fazerUploadImagemComFormData."
    );
  });

export async function fazerUploadImagemComFormData(formData: FormData) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { serverError: "Você precisa estar conectado para enviar uma foto." };
  }

  const userId = session.user.id;
  const arquivo = formData.get("arquivo") as File | null;
  const tipo = formData.get("tipo") as string | null;

  if (!arquivo || !tipo) {
    return { serverError: "Dados incompletos. Tente novamente." };
  }

  if (tipo !== "avatar" && tipo !== "banner") {
    return { serverError: "Tipo de imagem inválido." };
  }

  if (!TIPOS_MIME_PERMITIDOS.includes(arquivo.type)) {
    return {
      serverError:
        "Formato não suportado. Use JPEG, PNG, WebP ou GIF.",
    };
  }

  const limiteBytes =
    tipo === "avatar" ? LIMITE_AVATAR_BYTES : LIMITE_BANNER_BYTES;
  const limiteMb = tipo === "avatar" ? "2 MB" : "4 MB";
  const nomeAmigavel = tipo === "avatar" ? "foto de perfil" : "capa";

  if (arquivo.size > limiteBytes) {
    return {
      serverError: `A ${nomeAmigavel} precisa ter no máximo ${limiteMb}.`,
    };
  }

  const arrayBuffer = await arquivo.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const mimeReal = detectarMimeReal(buffer);
  if (!mimeReal || !TIPOS_MIME_PERMITIDOS.includes(mimeReal)) {
    return {
      serverError:
        "O arquivo enviado não é uma imagem válida. Use JPEG, PNG, WebP ou GIF.",
    };
  }

  const [userAtual] = await db
    .select({
      avatarUrl: users.avatarUrl,
      bannerUrl: users.bannerUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userAtual) {
    return { serverError: "Usuário não encontrado." };
  }

  const urlAnterior =
    tipo === "avatar" ? userAtual.avatarUrl : userAtual.bannerUrl;

  if (urlAnterior) {
    const pathAnterior = extrairPathDoBucket(urlAnterior);
    if (pathAnterior) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([pathAnterior]);
    }
  }

  const extensao = extrairExtensao(mimeReal);
  const timestamp = Date.now();
  const path = `${userId}/${tipo}-${timestamp}.${extensao}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: mimeReal,
      upsert: false,
    });

  if (uploadError) {
    return {
      serverError: `Não conseguimos enviar a ${nomeAmigavel}. Tente novamente.`,
    };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);

  const campo = tipo === "avatar" ? { avatarUrl: publicUrl } : { bannerUrl: publicUrl };

  await db
    .update(users)
    .set({
      ...campo,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    data: {
      success: true,
      url: publicUrl,
    },
  };
}
