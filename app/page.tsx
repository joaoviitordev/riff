import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-[430px] flex flex-col items-center justify-center">
        <Logo />
        <section className="flex flex-col my-12 w-full" data-purpose="main-content">
          <div className="text-center mb-10">
            <p className="text-riff-gray text-xl leading-snug">
              A comunidade de música que
              <br />
              <strong className="text-riff-light-gray font-semibold">
                você sempre quis ter.
              </strong>
            </p>
          </div>

          <ul className="space-y-6 self-center w-fit">
            <li className="flex items-start">
              <span className="text-riff-orange text-[10px] mt-2 mr-4 shrink-0">
                <i className="fa-solid fa-circle"></i>
              </span>
              <span className="text-riff-light-gray text-lg leading-snug">
                Compartilhe o que está ouvindo
              </span>
            </li>

            <li className="flex items-start">
              <span className="text-riff-orange text-[10px] mt-2 mr-4 shrink-0">
                <i className="fa-solid fa-circle"></i>
              </span>
              <span className="text-riff-light-gray text-lg leading-snug">
                Descubra bandas pelo gosto de outros fãs
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-riff-orange text-[10px] mt-2 mr-4 shrink-0">
                <i className="fa-solid fa-circle"></i>
              </span>
              <span className="text-riff-light-gray text-lg leading-snug">
                Conecte sua conta do Spotify
              </span>
            </li>
          </ul>
        </section>
        <footer className="w-full">
          <Link href="/login" className="block w-full">
            <Button className="bg-riff-orange text-white text-xl font-semibold py-6 rounded-full shadow-lg hover:bg-[#e6501a] transition-colors flex items-center justify-center gap-2 cursor-pointer w-full">
              Começar
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
