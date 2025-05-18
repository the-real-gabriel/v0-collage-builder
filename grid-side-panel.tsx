"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

interface GridSidePanelProps {
  gridWidth: number
  gridHeight: number
  cellSize: number
  gridGap: number
  onWidthChange: (width: number) => void
  onHeightChange: (height: number) => void
  onCellSizeChange: (size: number) => void
  onGridGapChange: (gap: number) => void
  onReset: () => void
}

export function GridSidePanel({
  gridWidth,
  gridHeight,
  cellSize,
  gridGap,
  onWidthChange,
  onHeightChange,
  onCellSizeChange,
  onGridGapChange,
}: GridSidePanelProps) {
  return (
    <div className="grid-side-panel space-y-4 p-2">
      <Accordion type="single" collapsible defaultValue="dimensions" className="w-full">
        <AccordionItem value="dimensions" className="border-b">
          <AccordionTrigger className="text-sm py-2 hover:no-underline">
            <span className="font-medium">Grid Dimensions</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="width" className="text-xs font-medium">
                    Width
                  </Label>
                  <span className="text-xs text-gray-500">{gridWidth}px</span>
                </div>
                <Slider
                  id="width"
                  min={400}
                  max={1600}
                  step={50}
                  value={[gridWidth]}
                  onValueChange={(value) => onWidthChange(value[0])}
                  className="my-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="height" className="text-xs font-medium">
                    Min Height
                  </Label>
                  <span className="text-xs text-gray-500">{gridHeight}px</span>
                </div>
                <Slider
                  id="height"
                  min={300}
                  max={1200}
                  step={50}
                  value={[gridHeight]}
                  onValueChange={(value) => onHeightChange(value[0])}
                  className="my-1"
                />
                <p className="text-xs text-gray-500 mt-1">Grid will expand vertically as needed</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="spacing" className="border-b">
          <AccordionTrigger className="text-sm py-2 hover:no-underline">
            <span className="font-medium">Spacing & Size</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cellSize" className="text-xs font-medium">
                    Base Cell Size
                  </Label>
                  <span className="text-xs text-gray-500">{cellSize}px</span>
                </div>
                <Slider
                  id="cellSize"
                  min={50}
                  max={200}
                  step={10}
                  value={[cellSize]}
                  onValueChange={(value) => onCellSizeChange(value[0])}
                  className="my-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cells will adapt to fit the grid, but this sets the base size
                </p>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gridGap" className="text-xs font-medium">
                    Grid Gap
                  </Label>
                  <span className="text-xs text-gray-500">{gridGap}px</span>
                </div>
                <Slider
                  id="gridGap"
                  min={0}
                  max={30}
                  step={2}
                  value={[gridGap]}
                  onValueChange={(value) => onGridGapChange(value[0])}
                  className="my-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-1 mt-2 p-2 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <div className="bg-blue-200 h-8 rounded"></div>
                <div className="bg-blue-200 h-8 rounded"></div>
                <div className="bg-blue-200 h-8 rounded"></div>
                <div className="bg-blue-200 h-8 rounded"></div>
                <div className="col-span-2 text-xs text-center text-gray-500 mt-1">Preview with {gridGap}px gap</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
