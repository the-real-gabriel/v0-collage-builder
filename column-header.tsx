"use client"

import { Plus, Minus, GripHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ColumnHeaderProps {
  index: number
  onAddColumn: (index: number) => void
  onRemoveColumn: (index: number) => void
  isLastColumn: boolean
}

export function ColumnHeader({ index, onAddColumn, onRemoveColumn, isLastColumn }: ColumnHeaderProps) {
  return (
    <div className="column-header flex items-center justify-center w-full">
      <div className="flex items-center gap-1 p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-black/5 text-black/40 hover:text-black/60"
                onClick={() => onAddColumn(index)}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add column left</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="tooltip-clean">
              <p>Add column left</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center justify-center h-6 w-6 text-xs font-medium text-black/30 select-none">
          <span className="sr-only">Column {index + 1}</span>
          <GripHorizontal className="h-3 w-3" />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-black/5 text-black/40 hover:text-black/60 disabled:opacity-20"
                onClick={() => onRemoveColumn(index)}
                disabled={isLastColumn}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Remove column</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="tooltip-clean">
              <p>{isLastColumn ? "Cannot remove last column" : "Remove column"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
