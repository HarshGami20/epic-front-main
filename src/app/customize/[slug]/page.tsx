import { Suspense } from "react";
import CustomizePageClient from "./CustomizePageClient";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-4">
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CustomizePageClient slug={slug} />
    </Suspense>
  );
}
