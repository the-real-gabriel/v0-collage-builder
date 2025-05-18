"use client"

import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LayoutTemplates, type LayoutTemplate } from "./layout-templates"
import { RefreshCw, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarPanelProps {
  gridWidth: number
  gridHeight: number
  rows: number
  columns: number
  cellSize: number
  gridGap: number
  onWidthChange: (width: number) => void
  onHeightChange: (height: number) => void
  onCellSizeChange: (size: number) => void
  onGridGapChange: (gap: number) => void
  onReset: () => void
  onApplySizePreset: (preset: any) => void
  onSwitchOrientation: () => void
  onApplyTemplate: (template: LayoutTemplate) => void
  currentImageCount: number
  onAddRow: () => void
  onRemoveRow: () => void
  onAddColumn: () => void
  onRemoveColumn: () => void
  children: React.ReactNode
}

export function SidebarPanel({
  gridWidth,
  gridHeight,
  rows,
  columns,
  cellSize,
  gridGap,
  onWidthChange,
  onHeightChange,
  onCellSizeChange,
  onGridGapChange,
  onReset,
  onApplySizePreset,
  onSwitchOrientation,
  onApplyTemplate,
  currentImageCount,
  children,
}: SidebarPanelProps) {
  // Calculate if we're in portrait or landscape mode
  const isPortrait = gridHeight > gridWidth

  // Calculate aspect ratio for display
  const aspectRatio = calculateAspectRatio(gridWidth, gridHeight)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <div className="flex-1">{children}</div>
        <Sidebar side="right" variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b border-black/[0.03]">
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-medium typography-heading">Grid Settings</h2>
              <SidebarTrigger className="z-50" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Accordion
              type="multiple"
              defaultValue={["dimensions", "spacing", "templates"]}
              className="w-full divide-y divide-black/[0.03] accordion-clean"
            >
              <AccordionItem value="dimensions">
                <AccordionTrigger className="accordion-trigger">Dimensions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="bg-black/[0.02] p-3 rounded-lg border border-black/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xs font-medium typography-heading">Current Dimensions</h3>
                          <p className="text-xs text-black/50 mt-1">
                            {gridWidth} × {gridHeight}px • {isPortrait ? "Portrait" : "Landscape"} • {aspectRatio}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onSwitchOrientation}
                          className="flex items-center gap-1 h-7 btn-subtle"
                          title="Switch orientation"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span className="text-xs">Rotate</span>
                        </Button>
                      </div>

                      <div className="space-y-5">
                        <div className="slider-container">
                          <div className="flex items-center justify-between slider-label-row">
                            <Label htmlFor="width" className="text-xs label-clean">
                              Width
                            </Label>
                            <div className="flex items-center">
                              <input
                                id="width"
                                type="number"
                                min="400"
                                max="2100"
                                step="50"
                                value={gridWidth}
                                onChange={(e) => {
                                  const value = Number.parseInt(e.target.value)
                                  if (!isNaN(value) && value >= 400 && value <= 2100) {
                                    onWidthChange(value)
                                  }
                                }}
                                className="w-16 h-7 px-2 text-xs text-right rounded-md border border-black/10 focus:outline-none focus:ring-1 focus:ring-black/20"
                              />
                              <span className="text-xs text-black/50 ml-1">px</span>
                            </div>
                          </div>
                        </div>

                        <div className="slider-container mt-4">
                          <div className="flex items-center justify-between slider-label-row">
                            <Label htmlFor="height" className="text-xs label-clean">
                              Height
                            </Label>
                            <div className="flex items-center">
                              <input
                                id="height"
                                type="number"
                                min="300"
                                max="2100"
                                step="50"
                                value={gridHeight}
                                onChange={(e) => {
                                  const value = Number.parseInt(e.target.value)
                                  if (!isNaN(value) && value >= 300 && value <= 2100) {
                                    onHeightChange(value)
                                  }
                                }}
                                className="w-16 h-7 px-2 text-xs text-right rounded-md border border-black/10 focus:outline-none focus:ring-1 focus:ring-black/20"
                              />
                              <span className="text-xs text-black/50 ml-1">px</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-medium label-clean">Common Aspect Ratios</h3>
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        <RatioPresetButton
                          name="Square"
                          ratio="1:1"
                          width={1000}
                          height={1000}
                          onClick={() =>
                            onApplySizePreset({
                              id: "square-1-1",
                              name: "Square",
                              ratio: "1:1",
                              width: 1000,
                              height: 1000,
                              category: "standard",
                            })
                          }
                          isActive={aspectRatio === "1:1"}
                        />
                        <RatioPresetButton
                          name="Classic"
                          ratio="4:3"
                          width={1200}
                          height={900}
                          onClick={() =>
                            onApplySizePreset({
                              id: "classic-4-3",
                              name: "Classic",
                              ratio: "4:3",
                              width: 1200,
                              height: 900,
                              category: "standard",
                            })
                          }
                          isActive={aspectRatio === "4:3"}
                        />
                        <RatioPresetButton
                          name="HD"
                          ratio="16:9"
                          width={1600}
                          height={900}
                          onClick={() =>
                            onApplySizePreset({
                              id: "widescreen-16-9",
                              name: "HD Widescreen",
                              ratio: "16:9",
                              width: 1600,
                              height: 900,
                              category: "widescreen",
                            })
                          }
                          isActive={aspectRatio === "16:9"}
                        />
                        <RatioPresetButton
                          name="Photo"
                          ratio="3:2"
                          width={1200}
                          height={800}
                          onClick={() =>
                            onApplySizePreset({
                              id: "classic-3-2",
                              name: "Photo",
                              ratio: "3:2",
                              width: 1200,
                              height: 800,
                              category: "photo",
                            })
                          }
                          isActive={aspectRatio === "3:2"}
                        />
                        <RatioPresetButton
                          name="Portrait"
                          ratio="3:4"
                          width={900}
                          height={1200}
                          onClick={() =>
                            onApplySizePreset({
                              id: "portrait-3-4",
                              name: "Portrait",
                              ratio: "3:4",
                              width: 900,
                              height: 1200,
                              category: "standard",
                            })
                          }
                          isActive={aspectRatio === "3:4"}
                        />
                        <RatioPresetButton
                          name="Mobile"
                          ratio="9:16"
                          width={900}
                          height={1600}
                          onClick={() =>
                            onApplySizePreset({
                              id: "portrait-9-16",
                              name: "Mobile",
                              ratio: "9:16",
                              width: 900,
                              height: 1600,
                              category: "widescreen",
                            })
                          }
                          isActive={aspectRatio === "9:16"}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="spacing">
                <AccordionTrigger className="accordion-trigger">Spacing</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="slider-container">
                      <div className="flex items-center justify-between slider-label-row">
                        <Label htmlFor="cellSize" className="text-xs font-medium label-clean">
                          Base Cell Size
                        </Label>
                        <span className="text-xs text-black/50">{cellSize}px</span>
                      </div>
                      <Slider
                        id="cellSize"
                        min={50}
                        max={200}
                        step={10}
                        value={[cellSize]}
                        onValueChange={(value) => onCellSizeChange(value[0])}
                        className="slider-thin"
                      />
                      <p className="text-xs text-black/50 mt-3 typography-caption">
                        Base size for cells (adapts to fit grid)
                      </p>
                    </div>

                    <div className="slider-container mt-6">
                      <div className="flex items-center justify-between slider-label-row">
                        <Label htmlFor="gridGap" className="text-xs font-medium label-clean">
                          Grid Gap
                        </Label>
                        <span className="text-xs text-black/50">{gridGap}px</span>
                      </div>
                      <Slider
                        id="gridGap"
                        min={0}
                        max={30}
                        step={2}
                        value={[gridGap]}
                        onValueChange={(value) => onGridGapChange(value[0])}
                        className="slider-thin"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="templates">
                <AccordionTrigger className="accordion-trigger">Templates</AccordionTrigger>
                <AccordionContent className="overflow-visible">
                  <div className="p-4 overflow-visible">
                    <div className="max-h-[400px] overflow-y-auto overflow-x-visible pr-1">
                      <LayoutTemplates
                        onSelectTemplate={onApplyTemplate}
                        currentImageCount={currentImageCount}
                        compact={true}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-auto p-4 border-t border-black/[0.03]">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full flex items-center gap-2 btn-subtle"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Grid
              </Button>
            </div>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
      </div>
    </SidebarProvider>
  )
}

// Helper function to calculate and format aspect ratio
function calculateAspectRatio(width: number, height: number): string {
  // Find the greatest common divisor (GCD)
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  const divisor = gcd(width, height)
  const simplifiedWidth = width / divisor
  const simplifiedHeight = height / divisor

  // If the simplified ratio has large numbers, return decimal format
  if (simplifiedWidth > 20 || simplifiedHeight > 20) {
    const ratio = width / height
    return ratio.toFixed(2) + ":1"
  }

  return `${simplifiedWidth}:${simplifiedHeight}`
}

// Ratio preset button component
interface RatioPresetButtonProps {
  name: string
  ratio: string
  width: number
  height: number
  onClick: () => void
  isActive: boolean
}

function RatioPresetButton({ name, ratio, width, height, onClick, isActive }: RatioPresetButtonProps) {
  // Calculate aspect ratio for visual representation
  const aspectRatio = width / height

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className={cn(
        "h-auto py-1 px-2 flex flex-col items-start justify-center",
        isActive ? "bg-black/80 hover:bg-black/90" : "btn-subtle",
      )}
      onClick={onClick}
      size="sm"
    >
      <div className="w-full flex items-center justify-between">
        <span className="font-medium text-xs">{name}</span>
        <div
          className={cn("border rounded-sm", isActive ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5")}
          style={{
            width: aspectRatio > 1 ? "16px" : 16 * aspectRatio + "px",
            height: aspectRatio < 1 ? "16px" : 16 / aspectRatio + "px",
          }}
        />
      </div>
      <span className={cn("text-[10px] w-full", isActive ? "text-white/70" : "text-black/50")}>{ratio}</span>
    </Button>
  )
}
