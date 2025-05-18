"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { exportCollageAsImage, downloadImage } from "@/services/export-service"
import { toast } from "@/components/ui/use-toast"

interface ExportCollageButtonProps {
  gridRef: React.RefObject<HTMLElement>
  collageTitle: string
}

export function ExportCollageButton({ gridRef, collageTitle }: ExportCollageButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!gridRef.current) return

    try {
      setIsExporting(true)

      const dataUrl = await exportCollageAsImage(gridRef.current, {
        format: "png",
        quality: 1.0,
      })

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `${collageTitle.replace(/\s+/g, "-")}-${timestamp}.png`

      // Download the image
      downloadImage(dataUrl, filename)

      toast({
        title: "Success",
        description: "Collage exported successfully",
      })
    } catch (err) {
      console.error("Error exporting collage:", err)
      toast({
        title: "Error",
        description: "Failed to export collage",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} className="bg-green-600 hover:bg-green-700">
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export
        </>
      )}
    </Button>
  )
}
