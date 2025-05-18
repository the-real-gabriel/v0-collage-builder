"use client"

import { Plus, Minus, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RowHeaderProps {
  index: number
  onAddRow: (index: number) => void
  onRemoveRow: (index: number) => void
  isLastRow: boolean
}

export function RowHeader({ index, onAddRow, onRemoveRow, isLastRow }: RowHeaderProps) {
  return (
    <div className="row-header flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-1 p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-black/5 text-black/40 hover:text-black/60"
                onClick={() => onAddRow(index)}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add row above</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="tooltip-clean">
              <p>Add row above</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center justify-center h-6 w-6 text-xs font-medium text-black/30 select-none">
          <span className="sr-only">Row {index + 1}</span>
          <GripVertical className="h-3 w-3" />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-black/5 text-black/40 hover:text-black/60 disabled:opacity-20"
                onClick={() => onRemoveRow(index)}
                disabled={isLastRow}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Remove row</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="tooltip-clean">
              <p>{isLastRow ? "Cannot remove last row" : "Remove row"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
