import { useMutation, useQueryClient } from "@tanstack/react-query";
import { seguirUsuario } from "@/app/actions/social/seguir-usuario.action";
import { deixarDeSeguirUsuario } from "@/app/actions/social/deixar-de-seguir.action";
import toast from "react-hot-toast";

export function useSeguir(targetUsername: string, currentUsername: string) {
  const queryClient = useQueryClient();

  const mutationSeguir = useMutation({
    mutationFn: async (usuarioId: string) => {
      const res = await seguirUsuario({ usuarioId });
      if (res?.serverError) {
        throw new Error(res.serverError);
      }
      return res?.data;
    },
    onSuccess: () => {
      toast.success(`Agora você está seguindo @${targetUsername}!`);
      queryClient.invalidateQueries({ queryKey: ["perfil", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["perfil", currentUsername] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao seguir usuário.");
    },
  });

  const mutationDeixarDeSeguir = useMutation({
    mutationFn: async (usuarioId: string) => {
      const res = await deixarDeSeguirUsuario({ usuarioId });
      if (res?.serverError) {
        throw new Error(res.serverError);
      }
      return res?.data;
    },
    onSuccess: () => {
      toast.success(`Você deixou de seguir @${targetUsername}.`);
      queryClient.invalidateQueries({ queryKey: ["perfil", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["perfil", currentUsername] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao deixar de seguir usuário.");
    },
  });

  return {
    seguir: mutationSeguir.mutate,
    isSeguindoLoading: mutationSeguir.isPending,
    deixarDeSeguir: mutationDeixarDeSeguir.mutate,
    isDeixarDeSeguirLoading: mutationDeixarDeSeguir.isPending,
  };
}
