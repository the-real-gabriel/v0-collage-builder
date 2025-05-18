"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, RotateCcw } from "lucide-react"
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogFooter,
} from "@/components/custom-dialog"
import { SizePresets, type SizePreset } from "./size-presets"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface GridSettingsModalProps {
  isOpen: boolean
  onClose: () => void
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
  onApplySizePreset: (preset: SizePreset) => void
  onSwitchOrientation: () => void
}

export function GridSettingsModal({
  isOpen,
  onClose,
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
}: GridSettingsModalProps) {
  const [showAllPresets, setShowAllPresets] = useState(false)

  // Calculate if we're in portrait or landscape mode
  const isPortrait = gridHeight > gridWidth

  // Calculate aspect ratio for display
  const aspectRatio = calculateAspectRatio(gridWidth, gridHeight)

  return (
    <CustomDialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto dialog-clean">
        <CustomDialogHeader>
          <CustomDialogTitle className="typography-heading">Grid Settings</CustomDialogTitle>
        </CustomDialogHeader>

        <Tabs defaultValue="dimensions" className="mt-4 tabs-slim">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="dimensions" className="tab-trigger">
              Dimensions
            </TabsTrigger>
            <TabsTrigger value="spacing" className="tab-trigger">
              Spacing
            </TabsTrigger>
            <TabsTrigger value="info" className="tab-trigger">
              Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-6">
            {/* Current dimensions with orientation toggle */}
            <div className="bg-black/[0.02] p-4 rounded-lg border border-black/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium typography-heading">Current Dimensions</h3>
                  <p className="text-xs text-black/50 mt-1">
                    {gridWidth} × {gridHeight}px • {isPortrait ? "Portrait" : "Landscape"} • {aspectRatio}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSwitchOrientation}
                  className="flex items-center gap-2 btn-subtle h-8"
                  title="Switch orientation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Rotate</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="width" className="text-sm label-clean">
                      Width
                    </Label>
                    <span className="text-xs text-black/50">{gridWidth}px</span>
                  </div>
                  <Slider
                    id="width"
                    min={400}
                    max={2100}
                    step={50}
                    value={[gridWidth]}
                    onValueChange={(value) => onWidthChange(value[0])}
                    className="slider-thin"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="height" className="text-sm label-clean">
                      Height
                    </Label>
                    <span className="text-xs text-black/50">{gridHeight}px</span>
                  </div>
                  <Slider
                    id="height"
                    min={300}
                    max={2100}
                    step={50}
                    value={[gridHeight]}
                    onValueChange={(value) => onHeightChange(value[0])}
                    className="slider-thin"
                  />
                </div>
              </div>
            </div>

            {/* Common aspect ratios section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium label-clean">Common Aspect Ratios</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="show-all-presets" className="text-xs cursor-pointer text-black/50">
                    Show all
                  </Label>
                  <Switch
                    id="show-all-presets"
                    checked={showAllPresets}
                    onCheckedChange={setShowAllPresets}
                    className="switch-slim"
                  />
                </div>
              </div>

              {!showAllPresets ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {/* Quick access ratio presets */}
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
                    name="Panoramic"
                    ratio="2:1"
                    width={2000}
                    height={1000}
                    onClick={() =>
                      onApplySizePreset({
                        id: "widescreen-2-1",
                        name: "Panoramic",
                        ratio: "2:1",
                        width: 2000,
                        height: 1000,
                        category: "widescreen",
                      })
                    }
                    isActive={aspectRatio === "2:1"}
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
                </div>
              ) : (
                <div className="col-span-3">
                  <SizePresets onSelectPreset={onApplySizePreset} currentWidth={gridWidth} currentHeight={gridHeight} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cellSize" className="text-sm label-clean">
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
                <p className="text-xs text-black/50 mt-1 typography-caption">
                  Base size for cells (adapts to fit grid)
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gridGap" className="text-sm label-clean">
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

                <div className="grid grid-cols-2 gap-1 mt-2 p-2 border border-dashed border-black/10 rounded-md bg-black/[0.01]">
                  <div className="bg-black/10 h-8 rounded-md"></div>
                  <div className="bg-black/10 h-8 rounded-md"></div>
                  <div className="bg-black/10 h-8 rounded-md"></div>
                  <div className="bg-black/10 h-8 rounded-md"></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="bg-black/[0.02] p-4 rounded-lg border border-black/[0.03]">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Rows:</span>
                  <span className="text-sm font-medium">{rows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Columns:</span>
                  <span className="text-sm font-medium">{columns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Width:</span>
                  <span className="text-sm font-medium">{gridWidth}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Height:</span>
                  <span className="text-sm font-medium">{gridHeight}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Cell Size:</span>
                  <span className="text-sm font-medium">{cellSize}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Grid Gap:</span>
                  <span className="text-sm font-medium">{gridGap}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Total Cells:</span>
                  <span className="text-sm font-medium">{rows * columns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Aspect Ratio:</span>
                  <span className="text-sm font-medium">{aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black/60">Orientation:</span>
                  <span className="text-sm font-medium">{isPortrait ? "Portrait" : "Landscape"}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <CustomDialogFooter className="mt-6 flex justify-between">
          <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-2 btn-subtle h-8">
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Grid
          </Button>
          <Button size="sm" onClick={onClose} className="btn-subtle h-8">
            Close
          </Button>
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
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
        "h-auto py-2 px-3 flex flex-col items-start justify-center",
        isActive ? "bg-black/80 hover:bg-black/90" : "btn-subtle",
      )}
      onClick={onClick}
    >
      <div className="w-full flex items-center justify-between mb-1">
        <span className="font-medium text-xs">{name}</span>
        <div
          className={cn("border rounded-sm", isActive ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5")}
          style={{
            width: aspectRatio > 1 ? "24px" : 24 * aspectRatio + "px",
            height: aspectRatio < 1 ? "24px" : 24 / aspectRatio + "px",
          }}
        />
      </div>
      <span className={cn("text-xs w-full", isActive ? "text-white/70" : "text-black/50")}>{ratio}</span>
    </Button>
  )
}
