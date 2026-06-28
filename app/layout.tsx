import type { Metadata } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from "@/lib/utils";

import Providers from "@/app/providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['300', '400', '500', '600', '700'], 
});

export const metadata: Metadata = {
  title: "Riff",
  description: "A comunidade de música que você sempre quis ter.",
  icons: {
    icon: "/riff-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={cn("h-full", "antialiased", plusJakartaSans.variable, "font-sans")}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

