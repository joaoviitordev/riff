import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-[#131313] pb-12 animate-pulse">
      {/* Skeleton do Cabeçalho */}
      <div className="w-full flex flex-col relative bg-[#131313]">
        <div className="w-full h-48 md:h-64 bg-[#1B1B1B] border-b border-border"></div>
        <div className="max-w-[800px] w-full mx-auto px-6 relative pb-6">
          <div className="absolute -top-16 left-6 md:-top-20 h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-[#131313] bg-[#252525]"></div>
          <div className="flex justify-end pt-4 pb-2 min-h-[70px]">
            <div className="h-14 w-32 bg-[#1B1B1B] rounded-full"></div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="h-8 md:h-10 w-48 bg-[#252525] rounded"></div>
            <div className="h-6 w-32 bg-[#1B1B1B] rounded"></div>
            <div className="h-4 w-full max-w-[500px] bg-[#1B1B1B] rounded mt-2"></div>
            <div className="h-4 w-3/4 max-w-[400px] bg-[#1B1B1B] rounded"></div>
            <div className="flex gap-6 mt-2">
              <div className="h-4 w-24 bg-[#1B1B1B] rounded"></div>
              <div className="h-4 w-24 bg-[#1B1B1B] rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton do Conteúdo */}
      <main className="max-w-[800px] w-full mx-auto px-6 mt-6 flex flex-col gap-8">
        {/* Card Ouvindo Agora */}
        <section>
          <div className="h-32 w-full bg-[#1B1B1B] rounded-2xl border border-border"></div>
        </section>

        {/* Abas e Métricas */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex border-b border-border w-full gap-4 pb-2">
              <div className="h-6 w-20 bg-[#252525] rounded"></div>
              <div className="h-6 w-20 bg-[#1B1B1B] rounded"></div>
            </div>
            <div className="h-10 w-40 bg-[#1B1B1B] rounded"></div>
          </div>
          
          <div className="w-full flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#1B1B1B] border border-border rounded-xl">
                <div className="w-6 h-6 bg-[#252525] rounded shrink-0"></div>
                <div className="w-12 h-12 bg-[#252525] rounded shrink-0"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-[#252525] rounded w-1/3"></div>
                  <div className="h-3 bg-[#252525] rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
