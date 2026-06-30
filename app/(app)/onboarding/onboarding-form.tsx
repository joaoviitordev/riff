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
import { verificarUsername } from "@/app/actions/perfil/verificar-username.action";
import { salvarPerfil } from "@/app/actions/perfil/salvar-perfil.action";

const onboardingSchema = z.object({
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
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  initialData: {
    name: string;
    avatarUrl: string | null;
  };
}

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      name: initialData.name,
      bio: "",
    },
  });

  const usernameValue = watch("username");

  // Debounce do username para a validação proativa (300ms)
  useEffect(() => {
    setUsernameInput(usernameValue);
    const handler = setTimeout(() => {
      setDebouncedUsername(usernameValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [usernameValue]);

  // Query para verificar disponibilidade usando TanStack Query
  const { data: availability, isFetching: isChecking } = useQuery({
    queryKey: ["verificar-username", debouncedUsername],
    queryFn: async () => {
      if (
        debouncedUsername.length < 3 ||
        !/^[a-z0-9_]+$/.test(debouncedUsername)
      ) {
        return null;
      }
      const response = await verificarUsername({ username: debouncedUsername });
      return response?.data ?? null;
    },
    enabled:
      debouncedUsername.length >= 3 && /^[a-z0-9_]+$/.test(debouncedUsername),
  });

  const onSubmit = async (values: OnboardingValues) => {
    setIsSubmitting(true);
    try {
      if (availability && !availability.disponivel) {
        toast.error("Esse @nome de usuário já está em uso. Tente outro.");
        setIsSubmitting(false);
        return;
      }

      const response = await salvarPerfil({
        username: values.username,
        name: values.name,
        bio: values.bio,
      });

      if (response?.serverError) {
        toast.error(response.serverError);
      } else if (response?.data?.success) {
        const targetPath = `/${response.data.username}`;
        toast.success(`Seja bem-vindo ao Riff, @${response.data.username}!`);
        router.refresh();
        if (typeof window !== "undefined") {
          window.location.assign(targetPath);
        } else {
          router.replace(targetPath);
        }
      } else {
        toast.error("Ocorreu um erro ao salvar o perfil.");
      }
    } catch (error) {
      toast.error("Não conseguimos salvar seu perfil. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUsernameValidFormat =
    usernameValue.length >= 3 && /^[a-z0-9_]+$/.test(usernameValue);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-[430px] flex flex-col gap-6">
        <header
          data-purpose="title-section"
          className="flex flex-col text-left"
        >
          <h1 className="text-3xl font-bold mb-2">Crie seu perfil</h1>
          <p className="text-riff-light-gray text-lg">
            Como a comunidade vai te conhecer...
          </p>
        </header>

        <section
          className="flex flex-col items-center justify-center"
          data-purpose="profile-upload"
        >
          <div className="relative group flex flex-col items-center">
            {initialData.avatarUrl ? (
              <img
                src={initialData.avatarUrl}
                alt={initialData.name || "Foto de perfil"}
                className="w-32 h-32 rounded-full object-cover mb-3 border-2 border-riff-orange shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-border bg-[#1B1B1B] flex items-center justify-center mb-3">
                <svg
                  className="text-riff-gray"
                  fill="none"
                  height="40"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
              </div>
            )}
            <p className="text-sm text-riff-gray italic">
              Foto importada do Spotify
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Nome de Exibição */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-riff-light-gray px-2">
              Nome de Exibição
            </label>
            <Input
              {...register("name")}
              placeholder="Seu nome"
              className="w-full p-6 rounded-full bg-[#1B1B1B] border-border text-white focus-visible:ring-riff-orange"
              maxLength={50}
            />
            {errors.name && (
              <span className="text-xs text-destructive px-2 mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Nome de Usuário (@handle) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-riff-light-gray px-2">
              @ Nome de Usuário
            </label>
            <div className="relative">
              <Input
                {...register("username", {
                  onChange: (e) => {
                    const cleanValue = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    setValue("username", cleanValue);
                  },
                })}
                placeholder="seunome"
                className="w-full p-6 rounded-full bg-[#1B1B1B] border-border text-white focus-visible:ring-riff-orange pl-8"
                maxLength={30}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-riff-gray font-semibold">
                @
              </span>
            </div>

            {/* Feedbacks em tempo real para o username (Filtragem Proativa P-004) */}
            {usernameValue.length > 0 && (
              <div className="px-2 mt-1 flex flex-col gap-1">
                {errors.username && (
                  <span className="text-xs text-destructive">
                    {errors.username.message}
                  </span>
                )}
                {!errors.username && usernameValue.length < 3 && (
                  <span className="text-xs text-riff-gray">
                    O nome deve ter pelo menos 3 caracteres.
                  </span>
                )}
                {isUsernameValidFormat && (
                  <div className="flex items-center gap-2">
                    {isChecking ? (
                      <span className="text-xs text-riff-gray animate-pulse">
                        Verificando disponibilidade...
                      </span>
                    ) : availability ? (
                      availability.disponivel ? (
                        <span className="text-xs text-emerald-500 font-medium">
                          Este @nome está disponível!
                        </span>
                      ) : (
                        <span className="text-xs text-destructive">
                          Este @nome já está sendo usado.
                        </span>
                      )
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Biografia */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-riff-light-gray px-2">
              Biografia (opcional)
            </label>
            <Textarea
              {...register("bio")}
              placeholder="Conte um pouco sobre seu gosto musical..."
              className="w-full p-6 rounded-2xl bg-[#1B1B1B] border-border text-white focus-visible:ring-riff-orange min-h-[100px] resize-none"
              maxLength={160}
            />
            {errors.bio && (
              <span className="text-xs text-destructive px-2 mt-1">
                {errors.bio.message}
              </span>
            )}
          </div>

          {/* Ações */}
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isChecking ||
              (isUsernameValidFormat && availability?.disponivel === false) ||
              !isUsernameValidFormat
            }
            className="bg-riff-orange text-white text-xl font-semibold py-6 rounded-full shadow-lg hover:bg-[#e6501a] disabled:bg-riff-gray/50 disabled:text-white/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer w-full mt-2"
          >
            {isSubmitting ? "Salvando..." : "Continuar"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full border-border bg-transparent hover:bg-[#1B1B1B] hover:text-white text-white py-6 rounded-full flex items-center justify-center gap-2 text-xl transition-colors cursor-pointer"
          >
            Voltar ao Início
          </Button>
        </form>
      </div>
    </div>
  );
}
