"use client"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Minus } from "lucide-react"

interface SidebarProps {
  rows: number
  onAddRow: (index: number) => void
  onRemoveRow: (index: number) => void
}

export function Sidebar({ rows, onAddRow, onRemoveRow }: SidebarProps) {
  return (
    <div className="sidebar p-2 flex flex-col items-center justify-center gap-4 w-[56px]">
      <div className="flex flex-row items-center bg-background/80 backdrop-blur-sm rounded-full p-1 border gap-1 transform -rotate-90">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-200"
                onClick={() => rows > 1 && onRemoveRow(rows - 1)}
                disabled={rows <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Remove row</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{rows <= 1 ? "Cannot remove row" : "Remove row"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mx-2 text-xs font-medium text-gray-500 flex items-center justify-center h-auto">
          <span className="whitespace-nowrap">
            {rows} {rows === 1 ? "row" : "rows"}
          </span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-200"
                onClick={() => onAddRow(rows)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add row</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add row</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
