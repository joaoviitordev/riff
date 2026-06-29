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

  const extensao = extrairExtensao(arquivo.type);
  const timestamp = Date.now();
  const path = `${userId}/${tipo}-${timestamp}.${extensao}`;

  const arrayBuffer = await arquivo.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: arquivo.type,
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
