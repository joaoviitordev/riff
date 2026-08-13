const RESERVADOS = new Set([
  "admin",
  "ajuda",
  "api",
  "buscar",
  "conta",
  "configuracoes",
  "explorar",
  "feed",
  "login",
  "logout",
  "notificacoes",
  "onboarding",
  "perfil",
  "privacidade",
  "riff",
  "sobre",
  "suporte",
  "termos",
]);

export function usernameEstaReservado(username: string): boolean {
  return RESERVADOS.has(username.trim().toLowerCase());
}
