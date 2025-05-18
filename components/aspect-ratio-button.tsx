"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AspectRatioButtonProps {
  name: string
  ratio: string
  width: number
  height: number
  onClick: () => void
  isActive: boolean
  compact?: boolean
}

export function AspectRatioButton({
  name,
  ratio,
  width,
  height,
  onClick,
  isActive,
  compact = false,
}: AspectRatioButtonProps) {
  // Calculate aspect ratio for visual representation
  const aspectRatio = width / height

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className={cn(
        "h-auto flex flex-col items-start justify-center",
        isActive ? "bg-black/80 hover:bg-black/90" : "btn-subtle",
        compact ? "py-1 px-2" : "py-2 px-3",
      )}
      onClick={onClick}
      size={compact ? "sm" : undefined}
    >
      <div className="w-full flex items-center justify-between mb-1">
        <span className="font-medium text-xs">{name}</span>
        <div
          className={cn("border rounded-sm", isActive ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5")}
          style={{
            width: aspectRatio > 1 ? (compact ? "16px" : "24px") : (compact ? 16 : 24) * aspectRatio + "px",
            height: aspectRatio < 1 ? (compact ? "16px" : "24px") : (compact ? 16 : 24) / aspectRatio + "px",
          }}
        />
      </div>
      <span className={cn("w-full", isActive ? "text-white/70" : "text-black/50", compact ? "text-[10px]" : "text-xs")}>
        {ratio}
      </span>
    </Button>
  )
}
