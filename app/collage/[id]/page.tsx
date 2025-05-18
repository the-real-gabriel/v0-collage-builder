import { Suspense } from "react"
import CollageViewer from "@/components/collage-viewer"

interface CollageViewerPageProps {
  params: {
    id: string
  }
}

export default function CollageViewerPage({ params }: CollageViewerPageProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <CollageViewer collageId={params.id} />
    </Suspense>
  )
}
