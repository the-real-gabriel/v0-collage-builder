"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, RefreshCw } from "lucide-react"

interface GridControlsProps {
  rows: number
  columns: number
  gridWidth: number
  gridHeight: number
  cellSize: number
  gridGap: number
  onUpdate: (rows: number, columns: number, width: number, height: number) => void
  onCellSizeChange: (size: number) => void
  onGridGapChange: (gap: number) => void
}

export function GridControls({
  rows,
  columns,
  gridWidth,
  gridHeight,
  cellSize,
  gridGap,
  onUpdate,
  onCellSizeChange,
  onGridGapChange,
}: GridControlsProps) {
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 20) {
      onUpdate(value, columns, gridWidth, gridHeight)
    }
  }

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 20) {
      onUpdate(rows, value, gridWidth, gridHeight)
    }
  }

  const handleWidthChange = (value: number[]) => {
    onUpdate(rows, columns, value[0], gridHeight)
  }

  const handleHeightChange = (value: number[]) => {
    onUpdate(rows, columns, gridWidth, value[0])
  }

  const handleCellSizeChange = (value: number[]) => {
    onCellSizeChange(value[0])
  }

  const handleGridGapChange = (value: number[]) => {
    onGridGapChange(value[0])
  }

  const incrementRows = () => {
    if (rows < 20) {
      onUpdate(rows + 1, columns, gridWidth, gridHeight)
    }
  }

  const decrementRows = () => {
    if (rows > 1) {
      onUpdate(rows - 1, columns, gridWidth, gridHeight)
    }
  }

  const incrementColumns = () => {
    if (columns < 20) {
      onUpdate(rows, columns + 1, gridWidth, gridHeight)
    }
  }

  const decrementColumns = () => {
    if (columns > 1) {
      onUpdate(rows, columns - 1, gridWidth, gridHeight)
    }
  }

  const resetGrid = () => {
    // Reset to 2x2 grid instead of 3x3
    onUpdate(2, 2, 800, 600)
    onCellSizeChange(100)
    onGridGapChange(10)
  }

  return (
    <div className="grid-controls card-subtle p-5">
      <h2 className="text-lg font-medium mb-4 typography-heading">Grid Controls</h2>

      <Tabs defaultValue="structure" className="tabs-slim">
        <TabsList className="mb-4">
          <TabsTrigger value="structure" className="tab-trigger">
            Structure
          </TabsTrigger>
          <TabsTrigger value="dimensions" className="tab-trigger">
            Dimensions
          </TabsTrigger>
          <TabsTrigger value="spacing" className="tab-trigger">
            Spacing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rows" className="label-clean">
                Rows (1-20)
              </Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementRows}
                  disabled={rows <= 1}
                  className="h-9 w-9 rounded-full btn-subtle"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={handleRowsChange}
                  className="mx-2 text-center input-slim"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementRows}
                  disabled={rows >= 20}
                  className="h-9 w-9 rounded-full btn-subtle"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="columns" className="label-clean">
                Columns (1-20)
              </Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementColumns}
                  disabled={columns <= 1}
                  className="h-9 w-9 rounded-full btn-subtle"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  id="columns"
                  type="number"
                  min="1"
                  max="20"
                  value={columns}
                  onChange={handleColumnsChange}
                  className="mx-2 text-center input-slim"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementColumns}
                  disabled={columns >= 20}
                  className="h-9 w-9 rounded-full btn-subtle"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dimensions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="width" className="label-clean">
                  Grid Width
                </Label>
                <span className="text-xs text-black/50">{gridWidth}px</span>
              </div>
              <Slider
                id="width"
                min={400}
                max={1600}
                step={50}
                value={[gridWidth]}
                onValueChange={handleWidthChange}
                className="slider-thin"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="height" className="label-clean">
                  Grid Height
                </Label>
                <span className="text-xs text-black/50">{gridHeight}px</span>
              </div>
              <Slider
                id="height"
                min={300}
                max={1200}
                step={50}
                value={[gridHeight]}
                onValueChange={handleHeightChange}
                className="slider-thin"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cellSize" className="label-clean">
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
                onValueChange={handleCellSizeChange}
                className="slider-thin"
              />
              <p className="text-xs text-black/50 mt-1 typography-caption">
                Cells will adapt to fit the grid, but this sets the base size
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spacing">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="gridGap" className="label-clean">
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
                onValueChange={handleGridGapChange}
                className="slider-thin"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 p-4 border border-dashed border-black/10 rounded-lg bg-black/[0.01]">
              <div className="bg-black/10 h-12 rounded-md"></div>
              <div className="bg-black/10 h-12 rounded-md"></div>
              <div className="bg-black/10 h-12 rounded-md"></div>
              <div className="bg-black/10 h-12 rounded-md"></div>
              <div className="col-span-2 text-xs text-center text-black/50 mt-2 typography-caption">
                Preview with {gridGap}px gap
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={resetGrid} className="flex items-center gap-2 btn-subtle">
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Grid
        </Button>
      </div>
    </div>
  )
}
