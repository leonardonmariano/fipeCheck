import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultDashboard } from "@/components/result-dashboard";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;

  const brandName = params.bn ?? "";
  const modelName = params.mn ?? "";
  const yearName  = params.yn ?? "";
  const title = [brandName, modelName, yearName].filter(Boolean).join(" ") || "Resultado";

  const ogUrl = `/api/og?${new URLSearchParams(params).toString()}`;

  return {
    title,
    openGraph: {
      title: `${title} | Quanto Custa Esse Trem?`,
      description: `Descubra o custo real de ter um ${brandName} ${modelName} no Brasil.`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `Custo real do ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Quanto Custa Esse Trem?`,
      images: [ogUrl],
    },
  };
}

// useSearchParams() inside ResultDashboard requires Suspense
export default function ResultadoPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ResultDashboard />
    </Suspense>
  );
}

function ResultSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
