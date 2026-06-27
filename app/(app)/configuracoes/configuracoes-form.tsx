"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { verificarUsername } from "@/app/actions/perfil/verificar-username.action";
import { salvarPerfil } from "@/app/actions/perfil/salvar-perfil.action";

const configSchema = z.object({
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
  avatarUrl: z
    .string()
    .url("Insira uma URL válida para a foto.")
    .optional()
    .or(z.literal("")),
});

type ConfigValues = z.infer<typeof configSchema>;

interface ConfiguracoesFormProps {
  initialData: {
    id: string;
    name: string;
    username: string;
    bio: string;
    avatarUrl: string | null;
  };
}

export default function ConfiguracoesForm({ initialData }: ConfiguracoesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState(initialData.username);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConfigValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      username: initialData.username,
      name: initialData.name,
      bio: initialData.bio,
      avatarUrl: initialData.avatarUrl || "",
    },
  });

  const usernameValue = watch("username");

  // Debounce do username para validação (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(usernameValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [usernameValue]);

  // Query de disponibilidade do username (pula validação se for igual ao inicial)
  const { data: availability, isFetching: isChecking } = useQuery({
    queryKey: ["verificar-username", debouncedUsername],
    queryFn: async () => {
      if (debouncedUsername === initialData.username) {
        return { disponivel: true };
      }
      if (debouncedUsername.length < 3 || !/^[a-z0-9_]+$/.test(debouncedUsername)) {
        return null;
      }
      const response = await verificarUsername({ username: debouncedUsername });
      return response?.data ?? null;
    },
    enabled: debouncedUsername !== initialData.username && debouncedUsername.length >= 3 && /^[a-z0-9_]+$/.test(debouncedUsername),
  });

  const onSubmit = async (values: ConfigValues) => {
    setIsSubmitting(true);
    try {
      // Se alterou o username, verifica se está disponível
      if (values.username !== initialData.username && availability && !availability.disponivel) {
        toast.error("Esse @nome de usuário já está em uso. Tente outro.");
        setIsSubmitting(false);
        return;
      }

      const response = await salvarPerfil({
        username: values.username,
        name: values.name,
        bio: values.bio,
        avatarUrl: values.avatarUrl ? values.avatarUrl : null,
      });

      if (response?.serverError) {
        throw new Error(response.serverError);
      }

      toast.success("Perfil atualizado com sucesso!", {
        duration: 2000,
      });

      // Define os valores salvos como o novo estado limpo (não-sujo) do formulário
      reset(values);

      setTimeout(() => {
        router.push(`/${values.username}`);
        router.refresh();
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-white py-12 px-6 flex flex-col justify-start items-center">
      <div className="max-w-[500px] w-full flex flex-col gap-8">
        {/* Header / Botão Voltar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-border bg-[#1B1B1B] hover:bg-surface-bright flex items-center justify-center cursor-pointer transition-colors text-riff-gray hover:text-white"
          >
            <IconArrowLeft size={20} />
          </button>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight">Editar Perfil</h1>
            <p className="text-sm text-riff-gray">Configure as informações do seu Riff</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Campo Nome */}
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="name" className="text-sm font-semibold text-riff-light-gray">
              Nome de Exibição
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              {...register("name")}
              className="h-12 bg-[#1B1B1B] border-border focus:border-riff-orange focus:ring-1 focus:ring-riff-orange rounded-xl text-white px-4"
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Campo Username */}
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="username" className="text-sm font-semibold text-riff-light-gray">
              Nome de Usuário (@)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-riff-gray font-medium">@</span>
              <Input
                id="username"
                type="text"
                placeholder="nome_usuario"
                {...register("username")}
                className="h-12 pl-8 bg-[#1B1B1B] border-border focus:border-riff-orange focus:ring-1 focus:ring-riff-orange rounded-xl text-white pr-4"
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 font-medium">{errors.username.message}</p>
            )}

            {/* Mensagem de Validação do Username */}
            {usernameValue !== initialData.username && usernameValue.length >= 3 && /^[a-z0-9_]+$/.test(usernameValue) && (
              <div className="text-xs mt-1 font-medium">
                {isChecking && <span className="text-riff-gray">Verificando disponibilidade...</span>}
                {!isChecking && availability?.disponivel && (
                  <span className="text-green-500">@nome de usuário disponível!</span>
                )}
                {!isChecking && availability && !availability.disponivel && (
                  <span className="text-red-500">Esse @nome de usuário já está em uso.</span>
                )}
              </div>
            )}
          </div>

          {/* Campo Bio */}
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="bio" className="text-sm font-semibold text-riff-light-gray">
              Bio
            </label>
            <Textarea
              id="bio"
              placeholder="Escreva algo sobre seu gosto musical..."
              rows={3}
              {...register("bio")}
              className="bg-[#1B1B1B] border-border focus:border-riff-orange focus:ring-1 focus:ring-riff-orange rounded-xl text-white p-4 resize-none"
            />
            {errors.bio && (
              <p className="text-xs text-red-500 font-medium">{errors.bio.message}</p>
            )}
          </div>

          {/* Campo Foto de Perfil */}
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="avatarUrl" className="text-sm font-semibold text-riff-light-gray">
              URL da Foto de Perfil
            </label>
            <Input
              id="avatarUrl"
              type="text"
              placeholder="https://exemplo.com/sua-foto.jpg"
              {...register("avatarUrl")}
              className="h-12 bg-[#1B1B1B] border-border focus:border-riff-orange focus:ring-1 focus:ring-riff-orange rounded-xl text-white px-4"
            />
            {errors.avatarUrl && (
              <p className="text-xs text-red-500 font-medium">{errors.avatarUrl.message}</p>
            )}
          </div>

          {/* Botão de Submissão */}
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty || (usernameValue !== initialData.username && availability && !availability.disponivel)}
            className="h-14 bg-riff-orange hover:bg-[#e6501a] text-white font-bold rounded-xl cursor-pointer text-base flex items-center justify-center gap-2 mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="animate-spin" size={20} />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
