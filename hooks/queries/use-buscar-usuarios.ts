import { useQuery } from "@tanstack/react-query";
import { buscarUsuarios } from "@/app/actions/perfil/buscar-usuarios.action";

export interface UsuarioEncontrado {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export const BUSCAR_USUARIOS_KEY = (termo: string) => ["buscar-usuarios", termo];

export function useBuscarUsuarios(termo: string) {
  const termoLimpo = termo.trim();
  const habilitado = termoLimpo.length >= 2;

  return useQuery({
    queryKey: BUSCAR_USUARIOS_KEY(termoLimpo),
    enabled: habilitado,
    queryFn: async (): Promise<UsuarioEncontrado[]> => {
      const resposta = await buscarUsuarios({ termo: termoLimpo });
      if (resposta?.serverError) {
        throw new Error(resposta.serverError);
      }
      return resposta?.data?.usuarios ?? [];
    },
  });
}
