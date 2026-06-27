"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SeletorPeriodo() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const periodoAtivo = searchParams.get("periodo") || "ultimo-mes";

  const handlePeriodoChange = (novoPeriodo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", novoPeriodo);
    router.push(`${pathname}?${params.toString()}`);
  };

  const periodos = [
    { value: "ultimo-mes", label: "Último mês" },
    { value: "ultimos-6-meses", label: "Últimos 6 meses" },
    { value: "todo-tempo", label: "Todo o tempo" },
  ];

  return (
    <div className="flex gap-2 p-1 bg-[#1B1B1B] border border-border rounded-full w-fit max-w-full overflow-x-auto shrink-0 scrollbar-none">
      {periodos.map((p) => (
        <button
          key={p.value}
          onClick={() => handlePeriodoChange(p.value)}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer ${
            periodoAtivo === p.value
              ? "bg-riff-orange text-white"
              : "text-riff-gray hover:text-white"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
