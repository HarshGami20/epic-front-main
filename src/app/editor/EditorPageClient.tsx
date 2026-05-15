"use client";

import { EditorProvider } from "@/features/pixel-editor/contexts/EditorContext";
import { PhotoEditor } from "@/features/pixel-editor/components/editor/PhotoEditor";

export default function EditorPageClient() {
  return (
    <EditorProvider>
      <PhotoEditor />
    </EditorProvider>
  );
}
