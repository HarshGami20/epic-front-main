"use client";

import { EditorProvider } from "@/features/pixel-editor/contexts/EditorContext";
import { PhotoEditor } from "@/features/pixel-editor/components/editor/PhotoEditor";

/** Demo editor (mock products). For real products use `/customize/[slug]`. */
export default function EditorDemoPage() {
  return (
    <EditorProvider>
      <PhotoEditor />
    </EditorProvider>
  );
}
