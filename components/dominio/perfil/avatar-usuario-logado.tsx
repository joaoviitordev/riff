import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarUsuarioLogadoProps {
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export default function AvatarUsuarioLogado({
  username,
  name,
  avatarUrl,
}: AvatarUsuarioLogadoProps) {
  const iniciais = (name || username)[0]?.toUpperCase() ?? "?";

  return (
    <Link
      href={`/${username}`}
      aria-label="Voltar para o seu perfil"
      className="shrink-0 rounded-full ring-offset-2 ring-offset-[#131313] transition-all hover:ring-2 hover:ring-riff-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riff-orange"
    >
      <Avatar className="size-14 border-2 border-border">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name || `@${username}`} />}
        <AvatarFallback className="bg-[#1B1B1B] text-riff-gray font-bold">
          {iniciais}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
