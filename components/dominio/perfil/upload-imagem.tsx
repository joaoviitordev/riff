"use client";

import { useState, useRef } from "react";
import { IconCamera, IconLoader2 } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { fazerUploadImagemComFormData } from "@/app/actions/perfil/fazer-upload-imagem.action";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const LIMITE_AVATAR = 2 * 1024 * 1024;
const LIMITE_BANNER = 4 * 1024 * 1024;

interface UploadImagemProps {
  tipo: "avatar" | "banner";
  urlAtual: string | null;
  fallbackInicial?: string;
  onUploadComplete: (url: string) => void;
}

export default function UploadImagem({
  tipo,
  urlAtual,
  fallbackInicial,
  onUploadComplete,
}: UploadImagemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const urlExibida = previewUrl || urlAtual;
  const nomeAmigavel = tipo === "avatar" ? "foto de perfil" : "capa";

  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      toast.error("Formato não suportado. Use JPEG, PNG, WebP ou GIF.");
      return;
    }

    const limite = tipo === "avatar" ? LIMITE_AVATAR : LIMITE_BANNER;
    const limiteMb = tipo === "avatar" ? "2 MB" : "4 MB";
    if (arquivo.size > limite) {
      toast.error(`A ${nomeAmigavel} precisa ter no máximo ${limiteMb}.`);
      return;
    }

    const objectUrl = URL.createObjectURL(arquivo);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      formData.append("tipo", tipo);

      const resultado = await fazerUploadImagemComFormData(formData);

      if (resultado.serverError) {
        toast.error(resultado.serverError);
        setPreviewUrl(null);
        return;
      }

      if (resultado.data?.success && resultado.data.url) {
        toast.success(
          tipo === "avatar"
            ? "Foto de perfil atualizada!"
            : "Capa atualizada!"
        );
        onUploadComplete(resultado.data.url);
      }
    } catch {
      toast.error(`Não conseguimos enviar a ${nomeAmigavel}. Tente novamente.`);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  if (tipo === "banner") {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full h-48 md:h-56 rounded-2xl overflow-hidden relative group cursor-pointer border border-border transition-all hover:border-riff-orange/40 disabled:cursor-wait"
        >
          {urlExibida ? (
            <img
              src={urlExibida}
              alt="Capa do perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-riff-orange/20 via-surface-low to-surface-bright" />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
            {isUploading ? (
              <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
                <IconLoader2 className="animate-spin text-white" size={20} />
                <span className="text-white text-sm font-medium">Enviando...</span>
              </div>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
                <IconCamera className="text-white" size={20} />
                <span className="text-white text-sm font-medium">Alterar capa</span>
              </div>
            )}
          </div>
        </button>
      </>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="relative group cursor-pointer disabled:cursor-wait"
      >
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border group-hover:border-riff-orange/50 transition-all duration-200 shadow-lg">
          {urlExibida ? (
            <img
              src={urlExibida}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#1B1B1B] flex items-center justify-center">
              <span className="text-3xl text-riff-gray font-bold">
                {fallbackInicial || "?"}
              </span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          {isUploading ? (
            <IconLoader2 className="animate-spin text-white" size={24} />
          ) : (
            <IconCamera
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              size={24}
            />
          )}
        </div>
      </button>
    </>
  );
}
