import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F59E0B" },
    { media: "(prefers-color-scheme: dark)", color: "#D97706" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Quanto Custa Esse Trem?",
    template: "%s | Quanto Custa Esse Trem?",
  },
  description:
    "Descubra o custo REAL de ter um carro no Brasil. Calcule depreciação, seguro, IPVA, combustível e muito mais com dados da tabela FIPE.",
  keywords: ["custo carro", "tabela fipe", "IPVA", "seguro auto", "depreciação", "custo real carro brasil"],
  authors: [{ name: "Quanto Custa Esse Trem?" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Quanto Custa Esse Trem?",
    description: "Descubra o custo REAL de ter um carro no Brasil. Calcule depreciação, seguro, IPVA, combustível e mais.",
    type: "website",
    locale: "pt_BR",
    url: "/",
    images: [{
      url: "/api/og?bn=Honda&mn=Civic&yn=2023+Gasolina&fv=120000&my=2023&km=1500&ft=gasoline&cn=12&st=SP&ag=30&fn=0&dp=20&tm=48&ir=1.5",
      width: 1200,
      height: 630,
      alt: "Quanto Custa Esse Trem? — calculadora de custo real de carro no Brasil",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quanto Custa Esse Trem?",
    description: "Descubra o custo REAL de ter um carro no Brasil.",
    images: ["/api/og?bn=Honda&mn=Civic&yn=2023+Gasolina&fv=120000&my=2023&km=1500&ft=gasoline&cn=12&st=SP&ag=30&fn=0&dp=20&tm=48&ir=1.5"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href="https://parallelum.com.br" />
        <link rel="dns-prefetch" href="https://parallelum.com.br" />
      </head>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Pular para o conteúdo principal
        </a>
        <Providers>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
            <p>
              Dados da{" "}
              <a
                href="https://deividfortuna.github.io/fipe/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Tabela FIPE
              </a>{" "}
              · Estimativas baseadas em médias nacionais ·{" "}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
