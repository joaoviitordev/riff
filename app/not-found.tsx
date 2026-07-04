import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { IconHome, IconSearch } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-[430px] flex flex-col items-center">
        <Logo />

        <section className="flex flex-col items-center text-center my-8 w-full">
          <p className="text-riff-orange text-7xl font-bold tracking-tighter">404</p>
          <h2 className="text-white text-2xl font-bold mt-4">
            Essa página não existe
          </h2>
          <p className="text-riff-gray text-lg leading-snug mt-3 max-w-[340px]">
            A página que você procurou saiu de cena. Que tal voltar para
            descobrir o que seus amigos estão ouvindo?
          </p>
        </section>

        <footer className="w-full flex flex-col gap-4">
          <Link href="/" className="block w-full">
            <Button className="w-full bg-riff-orange text-white text-xl font-semibold py-6 rounded-full shadow-lg hover:bg-[#e6501a] transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <IconHome size={22} />
              Voltar ao início
            </Button>
          </Link>

          <Link href="/login" className="block w-full">
            <Button
              variant="outline"
              className="w-full border-border bg-transparent hover:bg-muted text-white text-xl py-6 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <IconSearch size={22} />
              Conectar com Spotify
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
