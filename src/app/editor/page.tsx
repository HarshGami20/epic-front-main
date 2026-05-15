import { Suspense } from "react";
import EditorPageClient from "./EditorPageClient";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-4">
      <p className="text-sm font-medium">Loading editor…</p>
    </div>
  );
}

/** Demo editor (mock products). For real products use `/customize/[slug]`. */
export default function EditorDemoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditorPageClient />
    </Suspense>
  );
}
