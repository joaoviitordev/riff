import { cn } from "@/lib/utils";

interface MarcaRiffProps {
  className?: string;
}

export default function MarcaRiff({ className }: MarcaRiffProps) {
  return (
    <span
      className={cn(
        "flex items-end font-bold tracking-tighter text-white",
        className
      )}
    >
      Riff
      <span className="text-[0.8em] leading-none text-riff-orange">.</span>
    </span>
  );
}
