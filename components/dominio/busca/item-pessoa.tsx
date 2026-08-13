import Link from "next/link";
import Image from "next/image";

interface ItemPessoaProps {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  onNavegar?: () => void;
}

export default function ItemPessoa({
  username,
  name,
  avatarUrl,
  onNavegar,
}: ItemPessoaProps) {
  const inicial = (name || username)[0]?.toUpperCase() ?? "?";

  return (
    <Link
      href={`/${username}`}
      onClick={onNavegar}
      className="flex min-h-[72px] items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-surface-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riff-orange"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-[#131313]">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name || `@${username}`}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xl font-bold text-riff-gray">{inicial}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-white">
          {name || username}
        </span>
        <span className="truncate text-sm text-riff-orange">@{username}</span>
      </div>
    </Link>
  );
}
