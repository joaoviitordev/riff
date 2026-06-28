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
  metadataBase: new URL("https://riff-mauve.vercel.app"),
  title: {
    default: "Riff",
    template: "%s | Riff",
  },
  description: "A comunidade de música que você sempre quis ter. Conecte sua conta do Spotify e compartilhe suas músicas favoritas.",
  openGraph: {
    title: "Riff",
    description: "A comunidade de música que você sempre quis ter.",
    url: "/",
    siteName: "Riff",
    locale: "pt_BR",
    type: "website",
    // Imagem formatada para o WhatsApp e redes sociais
    images: [
      {
        url: "/riff-og.png", 
        width: 1200,
        height: 630,
        alt: "Riff - Comunidade de Música",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Riff",
    description: "A comunidade de música que você sempre quis ter.",
    images: ["/riff-og.png"],
  },
  icons: {
    icon: "/favicon.svg",
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

