import { TrendingDown, Car, PiggyBank } from "lucide-react";
import { CarFlow } from "@/components/car-flow";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Quanto Custa Esse Trem?",
  description: "Calculadora de custo real de carro no Brasil com dados da tabela FIPE. Calcule depreciação, seguro, IPVA, combustível e muito mais.",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  inLanguage: "pt-BR",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
};

// Fact cards — static, rendered server-side
const FACTS = [
  {
    icon: TrendingDown,
    title: "Depreciação invisível",
    body: "Um carro popular perde em média 12% do valor por ano. Quase ninguém conta isso no custo mensal.",
  },
  {
    icon: Car,
    title: "23% da renda média",
    body: "Brasileiros gastam em média 23% da renda com o carro quando todos os custos são somados.",
  },
  {
    icon: PiggyBank,
    title: "R$ 500k em 20 anos",
    body: "O custo de oportunidade de ter um carro, comparado a investir no CDI, pode passar de meio milhão.",
  },
] as const;

export default function HomePage() {
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ── Hero + selector ─────────────────────────────────────────────── */}
      <section className="grid gap-12 py-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span>🇧🇷</span>
            <span>Calculadora brasileira de custo real de carro</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Quanto Custa{" "}
            <span className="text-primary">Esse Trem?</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            A maioria das pessoas acha que ter um carro custa combustível + IPVA.
            A realidade é bem mais assustadora — e a gente vai te mostrar com
            dados reais da tabela FIPE.
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {["Depreciação real", "Seguro estimado", "IPVA por estado", "Comparação CDI"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Selector card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <CarFlow />
        </div>
      </section>

      {/* ── Fact cards ─────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-14">
        <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
          Por que calcular o custo real?
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {FACTS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
