"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCollage } from "@/services/collage-service"
import type { Collage, Box } from "@/types/database"

interface CollageViewerProps {
  collageId: string
}

export default function CollageViewer({ collageId }: CollageViewerProps) {
  const router = useRouter()
  const [collage, setCollage] = useState<Collage | null>(null)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCollage() {
      try {
        setIsLoading(true)
        const { collage, boxes } = await getCollage(collageId)

        if (!collage) {
          setError("Collage not found")
          return
        }

        setCollage(collage)
        setBoxes(boxes)
      } catch (err) {
        console.error("Error loading collage:", err)
        setError("Failed to load collage")
      } finally {
        setIsLoading(false)
      }
    }

    loadCollage()
  }, [collageId])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Calculate cell dimensions
  const cellWidth = collage ? (collage.width - (collage.columns - 1) * collage.grid_gap) / collage.columns : 0
  const cellHeight = collage ? (collage.height - (collage.rows - 1) * collage.grid_gap) / collage.rows : 0

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{collage?.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/collage-editor/${collageId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit
          </button>
          <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
            Back
          </button>
        </div>
      </div>

      {collage && (
        <div className="relative mx-auto overflow-hidden" style={{ width: collage.width, height: collage.height }}>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateRows: `repeat(${collage.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${collage.columns}, 1fr)`,
              gap: `${collage.grid_gap}px`,
              width: `${collage.width}px`,
              height: `${collage.height}px`,
              backgroundColor: collage.background_color,
              borderRadius: `${collage.corner_radius}px`,
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {boxes.map((box) => {
              const rowStart = Math.floor(box.position / collage.columns) + 1
              const colStart = (box.position % collage.columns) + 1
              const rowEnd = rowStart + box.row_span
              const colEnd = colStart + box.col_span

              return (
                <div
                  key={box.id}
                  style={{
                    gridRowStart: rowStart,
                    gridRowEnd: rowEnd,
                    gridColumnStart: colStart,
                    gridColumnEnd: colEnd,
                    borderRadius: `${collage.corner_radius}px`,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {box.image_url && (
                    <Image
                      src={box.image_url || "/placeholder.svg"}
                      alt={box.content || "Collage image"}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes={`(max-width: ${collage.width}px) 100vw, ${collage.width}px`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
