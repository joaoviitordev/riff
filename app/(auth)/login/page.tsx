import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-[430px] flex flex-col items-center gap-6">
        <Logo />
        <div className="flex items-center justify-center">
          <p className="text-riff-gray text-center text-xl">
            Conecte sua conta do Spotify
          </p>
        </div>
        <main className="w-full flex flex-col gap-4">
          <Button className="w-full bg-riff-spotify hover:bg-[#1ed760] text-white font-semibold py-6 rounded-full flex items-center justify-center gap-2 text-xl transition-colors cursor-pointer">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.31c-.22.36-.68.48-1.04.26-2.88-1.76-6.5-2.16-10.77-1.18-.41.09-.82-.16-.91-.57-.09-.41.16-.82.57-.91 4.67-1.07 8.67-.62 11.89 1.35.36.22.48.68.26 1.04zm1.46-3.26c-.28.45-.87.6-1.32.32-3.3-2.03-8.33-2.62-12.22-1.44-.51.15-1.04-.15-1.19-.66-.15-.51.15-1.04.66-1.19 4.45-1.35 10.01-.69 13.79 1.63.45.27.6.87.32 1.32zm.12-3.37C15.22 8.44 8.87 8.23 5.18 9.35c-.59.18-1.22-.16-1.4-.75-.18-.59.16-1.22.75-1.4 4.25-1.29 11.27-1.05 15.68 1.57.53.31.71 1 .39 1.53-.3.53-1 .71-1.53.39z" />
            </svg>
            Entrar com Spotify
          </Button>

          <Link href="/" className="block w-full">
            <Button
              variant="outline"
              className="w-full border-border bg-transparent hover:bg-muted text-white py-6 rounded-full flex items-center justify-center gap-2 text-xl transition-colors cursor-pointer"
            >
              Voltar ao Início
            </Button>
          </Link>
        </main>
      </div>
    </div>
  );
}
