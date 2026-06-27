export function formatDuracao(ms: number): string {
  const totalSegundos = Math.floor(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}min ${segundos.toString().padStart(2, "0")}s`;
}
