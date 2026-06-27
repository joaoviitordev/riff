"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Onboarding() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-[430px] flex flex-col gap-6">
        <div className="antialiased flex justify-center items-start flex-col">
          <header data-purpose="title-section">
            <h1 className="text-3xl font-bold mb-2">Crie seu perfil</h1>
            <p className="text-riff-light-gray text-lg">
              Como a comunidade vai te conhecer...
            </p>
          </header>
        </div>

        <section
          className="flex flex-col items-center justify-center"
          data-purpose="profile-upload"
        >
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-riff-dark-gray bg-riff-dark-gray/30 flex items-center justify-center mb-3">
              <svg
                className="text-riff-light-gray"
                fill="none"
                height="40"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </div>
            <Button className="text-riff-orange font-semibold text-center w-full rounded-full py-4 bg-transparent border border-transparent hover:bg-transparent hover:border-riff-orange cursor-pointer">
              Adicionar foto
            </Button>
          </div>
        </section>

        <div className="flex flex-col items-center justify-center gap-4">
          <Input
            placeholder="@seunome"
            className="w-full p-6 rounded-full bg-riff-dark-gray/50 text-white"
            type="text"
            maxLength={28}
          />

          <Textarea
            placeholder="Conte um pouco sobre você..."
            className="w-full p-6 rounded-2xl bg-riff-dark-gray/50 text-white min-h-[100px] resize-none"
            maxLength={120}
          />
          <Button className="bg-riff-orange text-white text-xl font-semibold py-6 rounded-full shadow-lg hover:bg-[#e6501a] transition-colors flex items-center justify-center gap-2 cursor-pointer w-full mt-2">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
