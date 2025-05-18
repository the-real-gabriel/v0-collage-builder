"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Minus, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RatioIcon as AspectRatio } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ZoomControls } from "@/components/zoom-controls"
import { AspectRatioButton } from "@/components/aspect-ratio-button"
import { LayoutTemplates } from "@/layout-templates"
import { calculateAspectRatio } from "@/utils/grid-utils"

import type { LayoutTemplate } from "@/layout-templates"
import type { SizePreset } from "@/size-presets"

interface TopbarProps {
  columns: number
  gridWidth: number
  gridHeight: number
  gridGap: number
  cornerRadius: number
  scale: number
  manualZoom: number | null
  widthInputValue: string
  heightInputValue: string
  onAddColumn: (index: number) => void
  onRemoveColumn: (index: number) => void
  onWidthInputChange: (value: string) => void
  onHeightInputChange: (value: string) => void
  onWidthInputBlur: () => void
  onHeightInputBlur: () => void
  onWidthInputKeyDown: (e: React.KeyboardEvent) => void
  onHeightInputKeyDown: (e: React.KeyboardEvent) => void
  onInputClick: (e: React.MouseEvent<HTMLInputElement>) => void
  applySizePreset: (preset: SizePreset) => void
  applyTemplate: (template: LayoutTemplate) => void
  updateGridGap: (gap: number) => void
  setCornerRadius: (radius: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToView: () => void
  onResetZoom: () => void
  boxesLength: number
}

export function Topbar({
  columns,
  gridWidth,
  gridHeight,
  gridGap,
  cornerRadius,
  scale,
  manualZoom,
  widthInputValue,
  heightInputValue,
  onAddColumn,
  onRemoveColumn,
  onWidthInputChange,
  onHeightInputChange,
  onWidthInputBlur,
  onHeightInputBlur,
  onWidthInputKeyDown,
  onHeightInputKeyDown,
  onInputClick,
  applySizePreset,
  applyTemplate,
  updateGridGap,
  setCornerRadius,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onResetZoom,
  boxesLength,
}: TopbarProps) {
  return (
    <div className="topbar p-2 flex items-center justify-between gap-4">
      {/* Column controls */}
      <div className="flex items-center bg-background/80 backdrop-blur-sm rounded-full p-1 border gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-200"
                onClick={() => columns > 1 && onRemoveColumn(columns - 1)}
                disabled={columns <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Remove column</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{columns <= 1 ? "Cannot remove column" : "Remove column"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mx-2 text-xs font-medium text-gray-500 min-w-[40px] text-center">
          {columns} {columns === 1 ? "column" : "columns"}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-200"
                onClick={() => onAddColumn(columns)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add column</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add column</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Dimensions info with direct input and aspect ratio button */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 flex items-center gap-2">
        <div className="flex items-center">
          <input
            type="text"
            value={widthInputValue}
            onChange={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onWidthInputChange(e.target.value)
            }}
            onBlur={onWidthInputBlur}
            onKeyDown={onWidthInputKeyDown}
            onClick={onInputClick}
            className="w-16 h-6 px-1 text-xs text-right rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <span className="text-xs text-gray-500 mx-1">×</span>
          <input
            type="text"
            value={heightInputValue}
            onChange={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onHeightInputChange(e.target.value)
            }}
            onBlur={onHeightInputBlur}
            onKeyDown={onHeightInputKeyDown}
            onClick={onInputClick}
            className="w-16 h-6 px-1 text-xs text-right rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <span className="text-xs text-gray-500 ml-1">px</span>
        </div>

        {/* Aspect ratio presets button and popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 ml-1 px-2 text-xs rounded-md hover:bg-gray-100 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <AspectRatio className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-600">Presets</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="end" alignOffset={-5} sideOffset={5}>
            <Tabs defaultValue="sizes" className="tabs-slim">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="sizes" className="tab-trigger">
                  Sizes
                </TabsTrigger>
                <TabsTrigger value="templates" className="tab-trigger">
                  Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sizes">
                <div className="space-y-2">
                  <h3 className="text-xs font-medium mb-2">Common Aspect Ratios</h3>
                  <div className="grid grid-cols-2 gap-1">
                    <AspectRatioButton
                      name="Square"
                      ratio="1:1"
                      width={1000}
                      height={1000}
                      onClick={() =>
                        applySizePreset({
                          id: "square-1-1",
                          name: "Square",
                          ratio: "1:1",
                          width: 1000,
                          height: 1000,
                          category: "standard",
                        })
                      }
                      isActive={calculateAspectRatio(gridWidth, gridHeight) === "1:1"}
                      compact={true}
                    />
                    <AspectRatioButton
                      name="Classic"
                      ratio="4:3"
                      width={1200}
                      height={900}
                      onClick={() =>
                        applySizePreset({
                          id: "classic-4-3",
                          name: "Classic",
                          ratio: "4:3",
                          width: 1200,
                          height: 900,
                          category: "standard",
                        })
                      }
                      isActive={calculateAspectRatio(gridWidth, gridHeight) === "4:3"}
                      compact={true}
                    />
                    <AspectRatioButton
                      name="HD"
                      ratio="16:9"
                      width={1600}
                      height={900}
                      onClick={() =>
                        applySizePreset({
                          id: "widescreen-16-9",
                          name: "HD Widescreen",
                          ratio: "16:9",
                          width: 1600,
                          height: 900,
                          category: "widescreen",
                        })
                      }
                      isActive={calculateAspectRatio(gridWidth, gridHeight) === "16:9"}
                      compact={true}
                    />
                    <AspectRatioButton
                      name="Photo"
                      ratio="3:2"
                      width={1200}
                      height={800}
                      onClick={() =>
                        applySizePreset({
                          id: "classic-3-2",
                          name: "Photo",
                          ratio: "3:2",
                          width: 1200,
                          height: 800,
                          category: "photo",
                        })
                      }
                      isActive={calculateAspectRatio(gridWidth, gridHeight) === "3:2"}
                      compact={true}
                    />
                    <AspectRatioButton
                      name="Portrait"
                      ratio="3:4"
                      width={900}
                      height={1200}
                      onClick={() =>
                        applySizePreset({
                          id: "portrait-3-4",
                          name: "Portrait",
                          ratio: "3:4",
                          width: 900,
                          height: 1200,
                          category: "standard",
                        })
                      }
                      isActive={calculateAspectRatio(gridWidth, gridHeight) === "3:4"}
                      compact={true}
                    />
                    <AspectRatioButton
                      name="Mobile"
                      ratio="9:16"
                      width={900}
                      height={1600}
                      onClick={() =>
                        applySizePreset({
                          id: "portrait-9-16",
                          name: "Mobile",
                          ratio: "9:16",
                          width: 900,
                          height: 1600,
                          category: "widescreen",
                        })
                      }
                      isActive={calculateAspectRatio(gridWidth, gridHeight) === "9:16"}
                      compact={true}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates">
                <div className="max-h-[300px] overflow-y-auto pr-1">
                  <LayoutTemplates onSelectTemplate={applyTemplate} currentImageCount={boxesLength} compact={true} />
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Settings popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs rounded-md hover:bg-gray-100 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Settings className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-600">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end" alignOffset={-5} sideOffset={5}>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Grid Settings</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gridGap" className="text-xs">
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
                    onValueChange={(value) => updateGridGap(value[0])}
                    className="slider-thin"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cornerRadius" className="text-xs">
                      Photo Corner Radius
                    </Label>
                    <span className="text-xs text-gray-500">{cornerRadius}px</span>
                  </div>
                  <Slider
                    id="cornerRadius"
                    min={0}
                    max={20}
                    step={1}
                    value={[cornerRadius]}
                    onValueChange={(value) => {
                      const newRadius = value[0]
                      setCornerRadius(newRadius)

                      // Immediately update the CSS variable for instant effect
                      document.documentElement.style.setProperty("--corner-radius", `${newRadius}px`)
                    }}
                    className="slider-thin"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Square</span>
                    <span className="text-xs text-gray-500">Rounded</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Zoom controls */}
      <ZoomControls
        scale={scale}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitToView={onFitToView}
        onResetZoom={onResetZoom}
      />
    </div>
  )
}
