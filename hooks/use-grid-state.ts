"use client"

import { useState, useCallback } from "react"
import { calculateAspectRatio, setCSSVariables } from "@/utils/grid-utils"
import { GRID_DIMENSIONS, CELL_DIMENSIONS, GRID_GAP, CORNER_RADIUS } from "@/utils/constants"

/**
 * Custom hook for managing grid state
 */
export function useGridState() {
  const [rows, setRows] = useState(2)
  const [columns, setColumns] = useState(2)
  const [gridWidth, setGridWidth] = useState(GRID_DIMENSIONS.DEFAULT_WIDTH)
  const [gridHeight, setGridHeight] = useState(GRID_DIMENSIONS.DEFAULT_HEIGHT)
  const [cellSize, setCellSize] = useState(CELL_DIMENSIONS.DEFAULT_SIZE)
  const [gridGap, setGridGap] = useState(GRID_GAP.DEFAULT)
  const [cornerRadius, setCornerRadius] = useState(CORNER_RADIUS.DEFAULT)
  const [scale, setScale] = useState(1)
  const [manualZoom, setManualZoom] = useState<number | null>(null)

  // Update grid dimensions
  const updateGridDimensions = useCallback(
    (newRows: number, newColumns: number, newWidth: number, newHeight: number) => {
      setRows(newRows)
      setColumns(newColumns)
      setGridWidth(newWidth)
      setGridHeight(newHeight)
    },
    [],
  )

  // Update cell size
  const updateCellSize = useCallback((newSize: number) => {
    setCellSize(newSize)
  }, [])

  // Update grid gap
  const updateGridGap = useCallback((newGap: number) => {
    setGridGap(newGap)
  }, [])

  // Update corner radius
  const updateCornerRadius = useCallback((newRadius: number) => {
    setCornerRadius(newRadius)
    document.documentElement.style.setProperty("--corner-radius", `${newRadius}px`)
  }, [])

  // Reset grid to default settings
  const resetGrid = useCallback(() => {
    setRows(2)
    setColumns(2)
    setGridWidth(GRID_DIMENSIONS.DEFAULT_WIDTH)
    setGridHeight(GRID_DIMENSIONS.DEFAULT_HEIGHT)
    setCellSize(CELL_DIMENSIONS.DEFAULT_SIZE)
    setGridGap(GRID_GAP.DEFAULT)
    setCornerRadius(CORNER_RADIUS.DEFAULT)
    setManualZoom(null)
  }, [])

  // Switch orientation (swap width and height)
  const switchOrientation = useCallback(() => {
    setGridWidth(gridHeight)
    setGridHeight(gridWidth)
  }, [gridWidth, gridHeight])

  // Calculate aspect ratio
  const aspectRatio = calculateAspectRatio(gridWidth, gridHeight)

  // Update CSS variables
  const updateCSSVariables = useCallback(() => {
    setCSSVariables(gridGap, cornerRadius, manualZoom || scale)
  }, [gridGap, cornerRadius, scale, manualZoom])

  return {
    rows,
    columns,
    gridWidth,
    gridHeight,
    cellSize,
    gridGap,
    cornerRadius,
    scale,
    manualZoom,
    aspectRatio,
    setRows,
    setColumns,
    setGridWidth,
    setGridHeight,
    setCellSize,
    setGridGap,
    setCornerRadius,
    setScale,
    setManualZoom,
    updateGridDimensions,
    updateCellSize,
    updateGridGap,
    updateCornerRadius,
    resetGrid,
    switchOrientation,
    updateCSSVariables,
  }
}
