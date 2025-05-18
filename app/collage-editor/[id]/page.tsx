import { Suspense } from "react"
import CollageEditorWrapper from "@/components/collage-editor-wrapper"

interface CollageEditorPageProps {
  params: {
    id: string
  }
}

export default function CollageEditorPage({ params }: CollageEditorPageProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <CollageEditorWrapper collageId={params.id} />
    </Suspense>
  )
}
