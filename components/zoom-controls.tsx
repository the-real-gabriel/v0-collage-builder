"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, Maximize, Maximize2 } from "lucide-react"

interface ZoomControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToView: () => void
  onResetZoom: () => void
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onFitToView, onResetZoom }: ZoomControlsProps) {
  return (
    <div className="zoom-controls flex flex-row items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full p-1 border">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={onZoomOut}
              disabled={scale <= 0.2}
            >
              <ZoomOut className="h-3.5 w-3.5" />
              <span className="sr-only">Zoom Out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="text-xs font-medium px-1 min-w-[40px] text-center">{Math.round(scale * 100)}%</div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={onZoomIn}
              disabled={scale >= 1}
            >
              <ZoomIn className="h-3.5 w-3.5" />
              <span className="sr-only">Zoom In</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onResetZoom}>
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="sr-only">Reset to 100%</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset to 100%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onFitToView}>
              <Maximize className="h-3.5 w-3.5" />
              <span className="sr-only">Fit to View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit to View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
