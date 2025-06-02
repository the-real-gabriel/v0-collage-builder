"use client"
import { getRandomColor, calculateCellDimensions, isValidImageUrl } from "@/utils/grid-utils"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Box } from "@/components/box"
import { EmptyCell } from "@/components/empty-cell"
import { ImageUploader } from "@/image-uploader"
import { toast } from "@/components/ui/use-toast"
import { Navigation } from "@/components/layout/navigation"
import { PhotoTray } from "@/components/photo-tray"
import { LAYOUT_TEMPLATES } from "@/layout-templates"
import { TOAST_DURATION } from "@/constants"

// Import the new TemplateCell component
import { TemplateCell } from "@/components/template-cell"

// Import types
import type { LayoutTemplate } from "@/layout-templates"
import type { SizePreset } from "@/size-presets"

// Import the new components
import { Topbar } from "@/components/topbar"
import { Sidebar } from "@/components/sidebar"

// Box interface
interface BoxItem {
  id: string
  content: string
  color: string
  imageUrl: string
  rowSpan: number
  colSpan: number
  position: number // Position in the grid
}

// Template placeholder interface
interface TemplatePlaceholder {
  position: number
  rowSpan: number
  colSpan: number
  templateId?: string // Optional template ID
  templateName?: string // Optional template name
}

// Auto place state interface for tracking changes
interface AutoPlaceState {
  trayCount: number
  emptyCount: number
  unusedCount: number
  lastPlacedCount: number
}

// Update the NavigationProps interface to include the onAddImages handler
interface NavigationProps {
  gridRef: React.RefObject<HTMLDivElement>
  gridData: {
    rows: number
    columns: number
    gridWidth: number
    gridHeight: number
    gridGap: number
    boxes: any[]
  }
  onAddImages: (files: FileList) => void
  emptyCount: number
}

// Interface for panning state
interface PanPosition {
  x: number
  y: number
}

export default function GridEditor() {
  const [rows, setRows] = useState(2)
  const [columns, setColumns] = useState(2)
  const [gridWidth, setGridWidth] = useState(800)
  const [gridHeight, setGridHeight] = useState(600)
  const [cellSize, setCellSize] = useState(100)
  const [gridGap, setGridGap] = useState(10)
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isMultiUpload, setIsMultiUpload] = useState(false)
  const [uploadPosition, setUploadPosition] = useState<number | null>(null)
  const [boxes, setBoxes] = useState<BoxItem[]>([]) // Start with an empty array instead of demo images
  const [templatePlaceholders, setTemplatePlaceholders] = useState<TemplatePlaceholder[]>([])
  const [scale, setScale] = useState(1) // Scale factor for the grid
  const [manualZoom, setManualZoom] = useState<number | null>(null) // Manual zoom override
  const [trayImages, setTrayImages] = useState<Array<{ id: string; url: string; inUse: boolean; content?: string }>>([])
  const [widthInputValue, setWidthInputValue] = useState(gridWidth.toString())
  const [heightInputValue, setHeightInputValue] = useState(gridHeight.toString())
  // Add state for rounded corners
  const [cornerRadius, setCornerRadius] = useState(0)

  // Add state for panning
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<PanPosition>({ x: 0, y: 0 })
  const [panPosition, setPanPosition] = useState<PanPosition>({ x: 0, y: 0 })
  const [initialPanPosition, setInitialPanPosition] = useState<PanPosition>({ x: 0, y: 0 })

  // Add state for space key tracking
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [cursorOverGrid, setCursorOverGrid] = useState(false)

  // Add a state to track if panning is possible
  const [canPan, setCanPan] = useState(false)

  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gridWrapperRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const lastAppliedTemplate = useRef<LayoutTemplate | null>(null)

  // Calculate and update scale factor when grid dimensions or viewport size changes
  useEffect(() => {
    const updateScaleAndPosition = () => {
      if (!canvasContainerRef.current || !gridWrapperRef.current) return

      // Get the available space for the grid from the canvas container
      const containerRect = canvasContainerRef.current.getBoundingClientRect()

      // Calculate desired padding (5% of container size or minimum 20px)
      const paddingX = Math.max(20, containerRect.width * 0.05)
      const paddingY = Math.max(20, containerRect.height * 0.05)

      // Available space accounting for padding
      const availableWidth = containerRect.width - paddingX * 2
      const availableHeight = containerRect.height - paddingY * 2

      // Calculate scale factors for width and height
      const widthScale = availableWidth / gridWidth
      const heightScale = availableHeight / gridHeight

      // Use the smaller scale factor to ensure the entire grid fits
      const calculatedScale = Math.min(widthScale, heightScale, 1) // Cap at 1 to avoid enlarging small grids

      // Use manual zoom if set, otherwise use calculated scale
      const newScale = manualZoom !== null ? manualZoom : calculatedScale
      setScale(newScale)

      // Apply the new scale and center the grid
      centerGridInContainer(newScale)
    }

    // Helper function to center the grid in the container
    const centerGridInContainer = (currentScale) => {
      if (!canvasContainerRef.current || !gridWrapperRef.current || !gridContainerRef.current) return

      const containerRect = canvasContainerRef.current.getBoundingClientRect()
      const wrapperElement = gridWrapperRef.current
      const gridElement = gridContainerRef.current

      // Calculate the scaled dimensions
      const scaledWidth = gridWidth * currentScale
      const scaledHeight = gridHeight * currentScale

      // Calculate the centered position
      const leftPosition = Math.round((containerRect.width - scaledWidth) / 2)
      const topPosition = Math.round((containerRect.height - scaledHeight) / 2)

      // Apply the centered position with direct positioning instead of transform
      wrapperElement.style.transform = "none" // Remove any transform
      wrapperElement.style.left = `${leftPosition}px`
      wrapperElement.style.top = `${topPosition}px`

      // Reset pan position when centering
      setPanPosition({ x: leftPosition, y: topPosition })
      setInitialPanPosition({ x: leftPosition, y: topPosition })

      // Ensure the grid container itself is properly positioned
      gridElement.style.transformOrigin = "0 0" // Set transform origin to top left
    }

    // Update scale and position immediately
    updateScaleAndPosition()

    // Add resize listener with debounce for better performance
    let resizeTimer
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateScaleAndPosition, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", handleResize)
    }
  }, [gridWidth, gridHeight, manualZoom, rows, columns])

  // Handle keyboard events for space key and deleting selected box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle space key for panning
      if (e.code === "Space" && !isSpacePressed) {
        e.preventDefault() // Prevent page scroll
        setIsSpacePressed(true)
      }

      // Handle delete/backspace for selected box
      if (selectedBoxId && (e.key === "Delete" || e.key === "Backspace")) {
        deleteBox(selectedBoxId)
        setSelectedBoxId(null)
        toast({
          title: "Image deleted",
          description: "Image was deleted using keyboard shortcut",
          duration: TOAST_DURATION,
        })
      } else if (e.key === "Escape") {
        setSelectedBoxId(null)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [selectedBoxId, isSpacePressed])

  // Set grid gap and corner radius as CSS variables for consistent styling
  useEffect(() => {
    if (gridContainerRef.current) {
      // Set all grid-related CSS variables
      document.documentElement.style.setProperty("--grid-gap", `${gridGap}px`)
      document.documentElement.style.setProperty("--corner-radius", `${cornerRadius}px`)
      document.documentElement.style.setProperty("--current-scale", `${scale}`)
      document.documentElement.style.setProperty("--grid-rows", `${rows}`)
      document.documentElement.style.setProperty("--grid-columns", `${columns}`)
      document.documentElement.style.setProperty("--grid-width", `${gridWidth}px`)
      document.documentElement.style.setProperty("--grid-height", `${gridHeight}px`)
    }
  }, [gridGap, cornerRadius, scale, rows, columns, gridWidth, gridHeight])

  // Update these state variables when gridWidth or gridHeight change
  useEffect(() => {
    setWidthInputValue(gridWidth.toString())
    setHeightInputValue(gridHeight.toString())
  }, [gridWidth, gridHeight])

  // Handle box selection
  const selectBox = useCallback((id: string) => {
    setSelectedBoxId((prevId) => (prevId === id ? null : id))
  }, [])

  // Calculate occupied positions based on current boxes
  const getOccupiedPositions = useCallback(() => {
    const occupied = new Map<number, string>() // Maps position to box id

    boxes.forEach((box) => {
      const startRow = Math.floor(box.position / columns)
      const startCol = box.position % columns

      // Mark all cells covered by this box as occupied
      for (let r = 0; r < box.rowSpan; r++) {
        for (let c = 0; c < box.colSpan; c++) {
          const pos = (startRow + r) * columns + (startCol + c)
          if (pos < rows * columns) {
            occupied.set(pos, box.id)
          }
        }
      }
    })

    return occupied
  }, [boxes, rows, columns])

  // Calculate empty positions
  const emptyPositions = useCallback(() => {
    const occupied = getOccupiedPositions()
    const empty = []

    // Also consider template placeholders as occupied
    const templatePositions = new Set()

    // Mark all cells covered by template placeholders as occupied
    templatePlaceholders.forEach((placeholder) => {
      const startRow = Math.floor(placeholder.position / columns)
      const startCol = placeholder.position % columns

      for (let r = 0; r < placeholder.rowSpan; r++) {
        for (let c = 0; c < placeholder.colSpan; c++) {
          const pos = (startRow + r) * columns + (startCol + c)
          if (pos < rows * columns) {
            templatePositions.add(pos)
          }
        }
      }
    })

    for (let i = 0; i < rows * columns; i++) {
      if (!occupied.has(i) && !templatePositions.has(i)) {
        empty.push(i)
      }
    }

    return empty
  }, [getOccupiedPositions, rows, columns, templatePlaceholders])

  // Function to move a box from one position to another
  const moveBox = useCallback(
    (dragIndex, hoverIndex) => {
      setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes]
        const draggedBox = newBoxes.find((box) => box.position === dragIndex)

        if (!draggedBox) return prevBoxes

        // Check if the box can fit in the new position
        const startRow = Math.floor(hoverIndex / columns)
        const startCol = hoverIndex % columns

        // Check if the box would go out of bounds
        if (startRow + draggedBox.rowSpan > rows || startCol + draggedBox.colSpan > columns) {
          return prevBoxes
        }

        // Check if all cells are unoccupied (except for the dragged box's current cells)
        const occupied = getOccupiedPositions()

        // Remove the dragged box's current position from occupied
        const currentStartRow = Math.floor(draggedBox.position / columns)
        const currentStartCol = draggedBox.position % columns
        for (let r = 0; r < draggedBox.rowSpan; r++) {
          for (let c = 0; c < draggedBox.colSpan; c++) {
            const pos = (currentStartRow + r) * columns + (currentStartCol + c)
            occupied.delete(pos)
          }
        }

        // Check if target position is free
        for (let r = 0; r < draggedBox.rowSpan; r++) {
          for (let c = 0; c < draggedBox.colSpan; c++) {
            const pos = (startRow + r) * columns + (startCol + c)
            if (occupied.has(pos)) {
              return prevBoxes // Position is occupied
            }
          }
        }

        // Update the position
        draggedBox.position = hoverIndex
        return [...newBoxes]
      })
    },
    [columns, rows, getOccupiedPositions],
  )

  // Function to move a box to a specific position (used by EmptyCell)
  const moveBoxToPosition = useCallback(
    (boxId: string, targetPosition: number) => {
      setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes]
        const draggedBox = newBoxes.find((box) => box.id === boxId)

        if (!draggedBox) return prevBoxes

        // Check if the box can fit in the new position
        const startRow = Math.floor(targetPosition / columns)
        const startCol = targetPosition % columns

        // Check if the box would go out of bounds
        if (startRow + draggedBox.rowSpan > rows || startCol + draggedBox.colSpan > columns) {
          return prevBoxes
        }

        // Check if all cells are unoccupied (except for the dragged box's current cells)
        const occupied = getOccupiedPositions()

        // Remove the dragged box's current position from occupied
        const currentStartRow = Math.floor(draggedBox.position / columns)
        const currentStartCol = draggedBox.position % columns
        for (let r = 0; r < draggedBox.rowSpan; r++) {
          for (let c = 0; c < draggedBox.colSpan; c++) {
            const pos = (currentStartRow + r) * columns + (currentStartCol + c)
            occupied.delete(pos)
          }
        }

        // Check if target position is free
        for (let r = 0; r < draggedBox.rowSpan; r++) {
          for (let c = 0; c < draggedBox.colSpan; c++) {
            const pos = (startRow + r) * columns + (startCol + c)
            if (occupied.has(pos)) {
              return prevBoxes // Position is occupied
            }
          }
        }

        // Update the position
        draggedBox.position = targetPosition
        return [...newBoxes]
      })

      // If this was a template placeholder, remove it
      setTemplatePlaceholders((prev) => {
        // Find the placeholder that contains the target position
        const placeholderToRemove = prev.find((p) => {
          const startRow = Math.floor(p.position / columns)
          const startCol = p.position % columns
          const endRow = startRow + p.rowSpan - 1
          const endCol = startCol + p.colSpan - 1

          const targetRow = Math.floor(targetPosition / columns)
          const targetCol = targetPosition % columns

          return targetRow >= startRow && targetRow <= endRow && targetCol >= startCol && targetCol <= endCol
        })

        if (placeholderToRemove) {
          return prev.filter((p) => p !== placeholderToRemove)
        }
        return prev
      })
    },
    [columns, rows, getOccupiedPositions],
  )

  // Function to swap two boxes
  const swapBoxes = useCallback(
    (sourceId: string, targetId: string) => {
      setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes]
        const sourceBox = newBoxes.find((box) => box.id === sourceId)
        const targetBox = newBoxes.find((box) => box.id === targetId)

        if (!sourceBox || !targetBox) return prevBoxes

        // Get positions and dimensions
        const sourceRow = Math.floor(sourceBox.position / columns)
        const sourceCol = sourceBox.position % columns
        const targetRow = Math.floor(targetBox.position / columns)
        const targetCol = targetBox.position % columns

        // Check if the swap would cause overlaps with other boxes
        const occupied = getOccupiedPositions()

        // Remove both boxes from occupied positions
        newBoxes.forEach((box) => {
          if (box.id === sourceId || box.id === targetId) {
            const boxRow = Math.floor(box.position / columns)
            const boxCol = box.position % columns
            for (let r = 0; r < box.rowSpan; r++) {
              for (let c = 0; c < box.colSpan; c++) {
                const pos = (boxRow + r) * columns + (boxCol + c)
                occupied.delete(pos)
              }
            }
          }
        })

        // Swap positions and dimensions
        const tempPosition = sourceBox.position
        const tempRowSpan = sourceBox.rowSpan
        const tempColSpan = sourceBox.colSpan

        sourceBox.position = targetBox.position
        sourceBox.rowSpan = targetBox.rowSpan
        sourceBox.colSpan = targetBox.colSpan

        targetBox.position = tempPosition
        targetBox.rowSpan = tempRowSpan
        targetBox.colSpan = tempColSpan

        toast({
          title: "Images swapped",
          description: "The images have been swapped and resized to fit their new locations",
          duration: TOAST_DURATION,
        })

        return newBoxes
      })
    },
    [columns, getOccupiedPositions],
  )

  // Function to add a row at a specific index
  const addRow = useCallback(
    (index: number) => {
      // Calculate the position where the new row starts
      const newRowStartPosition = index * columns

      // Update the positions of all boxes that are below the new row
      setBoxes((prevBoxes) => {
        return prevBoxes.map((box) => {
          const boxRow = Math.floor(box.position / columns)
          if (boxRow >= index) {
            // This box is below the new row, move it down
            return {
              ...box,
              position: box.position + columns,
            }
          }
          return box
        })
      })

      // Update template placeholders
      setTemplatePlaceholders((prev) => {
        return prev.map((placeholder) => {
          const placeholderRow = Math.floor(placeholder.position / columns)
          if (placeholderRow >= index) {
            // This placeholder is below the new row, move it down
            return {
              ...placeholder,
              position: placeholder.position + columns,
            }
          }
          return placeholder
        })
      })

      // Increase the row count
      setRows((prevRows) => prevRows + 1)

      toast({
        title: "Row added",
        description: `Added a new row at position ${index + 1}`,
        duration: TOAST_DURATION,
      })
    },
    [columns],
  )

  // Function to remove a row at a specific index
  const removeRow = useCallback(
    (index: number) => {
      // Don't allow removing the last row
      if (rows <= 1) return

      // Calculate the position where the row starts and ends
      const rowStartPosition = index * columns
      const rowEndPosition = rowStartPosition + columns - 1

      // Check if there are any boxes in this row
      const boxesInRow = boxes.filter((box) => {
        const boxRow = Math.floor(box.position / columns)
        const boxEndRow = Math.floor((box.position + (box.rowSpan - 1) * columns) / columns)
        return boxRow <= index && boxEndRow >= index
      })

      // Check if there are any template placeholders in this row
      const placeholdersInRow = templatePlaceholders.filter((placeholder) => {
        const placeholderRow = Math.floor(placeholder.position / columns)
        const placeholderEndRow = Math.floor((placeholder.position + (placeholder.rowSpan - 1) * columns) / columns)
        return placeholderRow <= index && placeholderEndRow >= index
      })

      if (boxesInRow.length > 0 || placeholdersInRow.length > 0) {
        toast({
          title: "Cannot remove row",
          description: "There are images or placeholders in this row. Please remove them first.",
          variant: "destructive",
          duration: TOAST_DURATION,
        })
        return
      }

      // Remove the row and update the positions of all boxes that are below it
      setBoxes((prevBoxes) => {
        return prevBoxes
          .filter((box) => {
            const boxRow = Math.floor(box.position / columns)
            return boxRow !== index // Remove boxes in this row
          })
          .map((box) => {
            const boxRow = Math.floor(box.position / columns)
            if (boxRow > index) {
              // This box is below the removed row, move it up
              return {
                ...box,
                position: box.position - columns,
              }
            }
            return box
          })
      })

      // Update template placeholders
      setTemplatePlaceholders((prev) => {
        return prev
          .filter((placeholder) => {
            const placeholderRow = Math.floor(placeholder.position / columns)
            return placeholderRow !== index // Remove placeholders in this row
          })
          .map((placeholder) => {
            const placeholderRow = Math.floor(placeholder.position / columns)
            if (placeholderRow > index) {
              // This placeholder is below the removed row, move it up
              return {
                ...placeholder,
                position: placeholder.position - columns,
              }
            }
            return placeholder
          })
      })

      // Decrease the row count
      setRows((prevRows) => prevRows - 1)

      toast({
        title: "Row removed",
        description: `Removed row at position ${index + 1}`,
        duration: TOAST_DURATION,
      })
    },
    [rows, columns, boxes, templatePlaceholders],
  )

  // Function to add a column at a specific index
  const addColumn = useCallback(
    (index: number) => {
      // Update the positions of all boxes that are to the right of the new column
      setBoxes((prevBoxes) => {
        return prevBoxes.map((box) => {
          const boxRow = Math.floor(box.position / columns)
          const boxCol = box.position % columns

          if (boxCol >= index) {
            // This box is to the right of the new column, move it right
            // We need to calculate the new position based on the new column count
            const newPosition = boxRow * (columns + 1) + (boxCol + 1)
            return {
              ...box,
              position: newPosition,
            }
          } else {
            // This box is to the left of the new column, adjust its position for the new column count
            const newPosition = boxRow * (columns + 1) + boxCol
            return {
              ...box,
              position: newPosition,
            }
          }
        })
      })

      // Update template placeholders
      setTemplatePlaceholders((prev) => {
        return prev.map((placeholder) => {
          const placeholderRow = Math.floor(placeholder.position / columns)
          const placeholderCol = placeholder.position % columns

          if (placeholderCol >= index) {
            // This placeholder is to the right of the new column, move it right
            const newPosition = placeholderRow * (columns + 1) + (placeholderCol + 1)
            return {
              ...placeholder,
              position: newPosition,
            }
          } else {
            // This placeholder is to the left of the removed column, adjust its position
            const newPosition = placeholderRow * (columns + 1) + placeholderCol
            return {
              ...placeholder,
              position: newPosition,
            }
          }
        })
      })

      // Increase the column count
      setColumns((prevColumns) => prevColumns + 1)

      toast({
        title: "Column added",
        description: `Added a new column at position ${index + 1}`,
        duration: TOAST_DURATION,
      })
    },
    [columns],
  )

  // Function to remove a column at a specific index
  const removeColumn = useCallback(
    (index: number) => {
      // Don't allow removing the last column
      if (columns <= 1) return

      // Check if there are any boxes in this column
      const boxesInColumn = boxes.filter((box) => {
        const boxCol = box.position % columns
        const boxEndCol = (box.position % columns) + (box.colSpan - 1)
        return boxCol <= index && boxEndCol >= index
      })

      // Check if there are any template placeholders in this column
      const placeholdersInColumn = templatePlaceholders.filter((placeholder) => {
        const placeholderCol = placeholder.position % columns
        const placeholderEndCol = (placeholder.position % columns) + (placeholder.colSpan - 1)
        return placeholderCol <= index && placeholderEndCol >= index
      })

      if (boxesInColumn.length > 0 || placeholdersInColumn.length > 0) {
        toast({
          title: "Cannot remove column",
          description: "There are images or placeholders in this column. Please remove them first.",
          variant: "destructive",
          duration: TOAST_DURATION,
        })
        return
      }

      // Remove the column and update the positions of all boxes that are to the right of it
      setBoxes((prevBoxes) => {
        return prevBoxes
          .filter((box) => {
            const boxCol = box.position % columns
            return boxCol !== index // Remove boxes in this column
          })
          .map((box) => {
            const boxRow = Math.floor(box.position / columns)
            const boxCol = box.position % columns

            if (boxCol > index) {
              // This box is to the right of the removed column, move it left
              // We need to calculate the new position based on the new column count
              const newPosition = boxRow * (columns - 1) + (boxCol - 1)
              return {
                ...box,
                position: newPosition,
              }
            } else {
              // This box is to the left of the removed column, adjust its position for the new column count
              const newPosition = boxRow * (columns - 1) + boxCol
              return {
                ...box,
                position: newPosition,
              }
            }
          })
      })

      // Update template placeholders
      setTemplatePlaceholders((prev) => {
        return prev
          .filter((placeholder) => {
            const placeholderCol = placeholder.position % columns
            return placeholderCol !== index // Remove placeholders in this column
          })
          .map((placeholder) => {
            const placeholderRow = Math.floor(placeholder.position / columns)
            const placeholderCol = placeholder.position % columns

            if (placeholderCol > index) {
              // This placeholder is to the right of the removed column, move it left
              const newPosition = placeholderRow * (columns - 1) + (placeholderCol - 1)
              return {
                ...placeholder,
                position: newPosition,
              }
            } else {
              // This placeholder is to the left of the removed column, adjust its position
              const newPosition = placeholderRow * (columns - 1) + placeholderCol
              return {
                ...placeholder,
                position: newPosition,
              }
            }
          })
      })

      // Decrease the column count
      setColumns((prevColumns) => prevColumns - 1)

      toast({
        title: "Column removed",
        description: `Removed column at position ${index + 1}`,
        duration: TOAST_DURATION,
      })
    },
    [columns, boxes, templatePlaceholders],
  )

  // Inside the GridEditor component, add the addImageToTray function before it's used
  const addImageToTray = useCallback(
    (imageUrl: string) => {
      // Generate a unique ID for the new tray image
      const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9)

      // Check if the image is already in the tray
      const existingImageIndex = trayImages.findIndex((img) => img.url === imageUrl)

      if (existingImageIndex === -1) {
        // If not in tray, add it
        setTrayImages((prev) => [
          ...prev,
          {
            id: newId,
            url: imageUrl,
            inUse: true, // Mark as in use since it's being added to the grid
            content: `Image ${newId.slice(-3)}`,
          },
        ])
      } else {
        // If already in tray, mark as in use
        setTrayImages((prev) => prev.map((img) => (img.url === imageUrl ? { ...img, inUse: true } : img)))
      }
    },
    [trayImages],
  )

  // Then update the addBox function to remove the circular dependency
  const addBox = useCallback(
    (position: number, imageUrl: string) => {
      // Check if this position is already occupied
      const occupied = getOccupiedPositions()
      if (occupied.has(position)) {
        console.warn(`Position ${position} is already occupied, cannot add box`)
        return
      }

      // Check if this position is a template placeholder
      const placeholder = templatePlaceholders.find((p) => {
        const startRow = Math.floor(p.position / columns)
        const startCol = p.position % columns
        const endRow = startRow + p.rowSpan - 1
        const endCol = startCol + p.colSpan - 1

        const targetRow = Math.floor(position / columns)
        const targetCol = position % columns

        return targetRow >= startRow && targetRow <= endRow && targetCol >= startCol && targetCol <= endCol
      })

      // Only add the image to the tray if it's not already there
      const imageExists = trayImages.some((img) => img.url === imageUrl)
      if (!imageExists) {
        addImageToTray(imageUrl)
      }

      setBoxes((prevBoxes) => {
        const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9)
        const newBox = {
          id: newId,
          content: `Image ${newId.slice(-3)}`,
          color: getRandomColor(),
          imageUrl,
          rowSpan: placeholder ? placeholder.rowSpan : 1,
          colSpan: placeholder ? placeholder.colSpan : 1,
          position: placeholder ? placeholder.position : position,
        }
        return [...prevBoxes, newBox]
      })

      // If this was a template placeholder, remove it
      if (placeholder) {
        setTemplatePlaceholders((prev) => prev.filter((p) => p !== placeholder))
      }

      // Mark the image as in use in the tray if it exists there
      setTrayImages((prevTrayImages) => {
        return prevTrayImages.map((img) => (img.url === imageUrl ? { ...img, inUse: true } : img))
      })
    },
    [templatePlaceholders, getOccupiedPositions, addImageToTray, trayImages, columns],
  )

  // Function to update grid dimensions with debouncing for smoother updates
  const updateGridDimensions = useCallback((newRows, newColumns, newWidth, newHeight) => {
    // Update dimensions immediately without any constraints
    setRows(newRows)
    setColumns(newColumns)
    setGridWidth(newWidth)
    setGridHeight(newHeight)

    // Use a slight delay for box adjustments to prevent rapid recalculations
    const timeoutId = setTimeout(() => {
      // Filter out boxes that would be out of bounds
      setBoxes((prevBoxes) => {
        return prevBoxes.filter((box) => {
          const startRow = Math.floor(box.position / newColumns)
          const startCol = box.position % newColumns
          return (
            startRow < newRows &&
            startCol < newColumns &&
            startRow + box.rowSpan <= newRows &&
            startCol + box.colSpan <= newColumns
          )
        })
      })

      // Filter out template placeholders that would be out of bounds
      setTemplatePlaceholders((prev) => {
        return prev.filter((placeholder) => {
          const startRow = Math.floor(placeholder.position / newColumns)
          const startCol = placeholder.position % newColumns
          return (
            startRow < newRows &&
            startCol < newColumns &&
            startRow + placeholder.rowSpan <= newRows &&
            startCol + placeholder.colSpan <= newColumns
          )
        })
      })
    }, 100) // Small delay for better performance

    return () => clearTimeout(timeoutId)
  }, [])

  // Function to update cell size
  const updateCellSize = useCallback((newSize: number) => {
    setCellSize(newSize)
  }, [])

  // Function to update grid gap
  const updateGridGap = useCallback((newGap: number) => {
    setGridGap(newGap)
  }, [])

  // Replace the deleteBox function with this:
  const deleteBox = useCallback(
    (id: string) => {
      // Find the box before deleting it
      const boxToDelete = boxes.find((box) => box.id === id)

      if (boxToDelete) {
        // Add the image to the tray
        setTrayImages((prevTrayImages) => {
          // Check if this image is already in the tray
          const existingIndex = prevTrayImages.findIndex((img) => img.url === boxToDelete.imageUrl)

          if (existingIndex !== -1) {
            // Update existing tray image
            return prevTrayImages.map((img) => (img.url === boxToDelete.imageUrl ? { ...img, inUse: false } : img))
          } else {
            // Add new tray image
            return [
              ...prevTrayImages,
              {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                url: boxToDelete.imageUrl,
                inUse: false,
                content: boxToDelete.content,
              },
            ]
          }
        })
      }

      // Remove the box from the grid
      setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== id))
      if (selectedBoxId === id) {
        setSelectedBoxId(null)
      }
    },
    [selectedBoxId, boxes],
  )

  // Add image from tray to grid
  const addImageFromTray = useCallback(
    (imageId: string) => {
      // Find the image in the tray
      const trayImage = trayImages.find((img) => img.id === imageId)
      if (!trayImage) return

      // Check if there are any template placeholders
      if (templatePlaceholders.length > 0) {
        // Use the first template placeholder
        const placeholder = templatePlaceholders[0]
        addBox(placeholder.position, trayImage.url)

        // Mark the image as in use
        setTrayImages((prevTrayImages) =>
          prevTrayImages.map((img) => (img.id === imageId ? { ...img, inUse: true } : img)),
        )

        toast({
          title: "Image added to template",
          description: "Image added to the template placeholder",
          duration: TOAST_DURATION,
        })
        return
      }

      // If no template placeholders, find the first empty position
      const emptyPositionsArray = emptyPositions()
      if (emptyPositionsArray.length === 0) {
        toast({
          title: "No empty cells",
          description: "There are no empty cells to add the image to. Remove an image or add a new cell first.",
          variant: "destructive",
          duration: TOAST_DURATION,
        })
        return
      }

      // Add the image to the grid
      addBox(emptyPositionsArray[0], trayImage.url)

      // Mark the image as in use
      setTrayImages((prevTrayImages) =>
        prevTrayImages.map((img) => (img.id === imageId ? { ...img, inUse: true } : img)),
      )

      toast({
        title: "Image added",
        description: "Image added to the grid from your photo tray",
        duration: TOAST_DURATION,
      })
    },
    [trayImages, addBox, emptyPositions, toast, templatePlaceholders],
  )

  // Remove image from tray
  const removeImageFromTray = useCallback(
    (imageId: string) => {
      setTrayImages((prevTrayImages) => prevTrayImages.filter((img) => img.id !== imageId))

      toast({
        title: "Image removed",
        description: "Image removed from your photo tray",
        duration: TOAST_DURATION,
      })
    },
    [toast],
  )

  // Clear all images from tray
  const clearTray = useCallback(() => {
    setTrayImages([])

    toast({
      title: "Tray cleared",
      description: "All images have been removed from your photo tray",
      duration: TOAST_DURATION,
    })
  }, [toast])

  // Process files for adding to tray
  const handleAddImagesToTray = useCallback(
    (files: FileList) => {
      if (files.length === 0) return

      const processFiles = () => {
        const newImages: Array<{ id: string; url: string; inUse: boolean; content?: string }> = []
        let processed = 0
        const totalFiles = files.length

        const processFile = (file: File) => {
          if (!file.type.startsWith("image/")) {
            processed++
            checkCompletion()
            return
          }

          const reader = new FileReader()

          reader.onload = (e) => {
            if (e.target?.result) {
              const imageUrl = e.target.result as string

              if (isValidImageUrl(imageUrl)) {
                const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9) + processed
                newImages.push({
                  id: newId,
                  url: imageUrl,
                  inUse: false,
                  content: `Image ${newId.slice(-3)}`,
                })
              }
            }

            processed++
            checkCompletion()
          }

          reader.onerror = () => {
            processed++
            checkCompletion()
          }

          try {
            reader.readAsDataURL(file)
          } catch (error) {
            processed++
            checkCompletion()
          }
        }

        const checkCompletion = () => {
          if (processed === totalFiles) {
            if (newImages.length > 0) {
              setTrayImages((prev) => [...prev, ...newImages])

              toast({
                title: "Images added to tray",
                description: `Added ${newImages.length} image${newImages.length !== 1 ? "s" : ""} to your photo tray`,
                duration: TOAST_DURATION,
              })
            } else {
              toast({
                title: "No images added",
                description: "No valid images were found in the selected files",
                duration: TOAST_DURATION,
              })
            }
          }
        }

        Array.from(files).forEach(processFile)
      }

      processFiles()
    },
    [toast],
  )

  // Function to automatically place images from tray to grid
  const placeAllImages = useCallback(() => {
    if (trayImages.length === 0) return

    // Get unused images from tray
    const unusedImages = trayImages.filter((img) => !img.inUse)
    if (unusedImages.length === 0) {
      toast({
        title: "No images to place",
        description: "All images from your tray are already in use.",
        duration: 3000,
      })
      return
    }

    // Get template placeholders first
    const templatePositions = templatePlaceholders.map((p) => p)

    // Then get empty positions
    const emptyPositionsArray = emptyPositions()

    // If no positions available, show message
    if (templatePositions.length === 0 && emptyPositionsArray.length === 0) {
      toast({
        title: "No empty cells available",
        description: `Add more cells to place your ${unusedImages.length} unused image${unusedImages.length !== 1 ? "s" : ""}.`,
        duration: 3000,
      })
      return
    }

    // Determine how many images we can place
    const imagesToPlace = unusedImages.slice(
      0,
      Math.min(unusedImages.length, templatePositions.length + emptyPositionsArray.length),
    )
    let placedCount = 0

    // First fill template placeholders
    for (let i = 0; i < Math.min(templatePositions.length, imagesToPlace.length); i++) {
      const placeholder = templatePositions[i]
      const image = imagesToPlace[i]

      addBox(placeholder.position, image.url)

      // Mark as in use
      setTrayImages((prev) => prev.map((img) => (img.id === image.id ? { ...img, inUse: true } : img)))
      placedCount++
    }

    // Then fill empty positions with remaining images
    if (placedCount < imagesToPlace.length) {
      const remainingImages = imagesToPlace.slice(placedCount)
      const availableEmptyPositions = emptyPositionsArray.slice(0, remainingImages.length)

      for (let i = 0; i < availableEmptyPositions.length; i++) {
        const position = availableEmptyPositions[i]
        const image = remainingImages[i]

        addBox(position, image.url)

        // Mark as in use
        setTrayImages((prev) => prev.map((img) => (img.id === image.id ? { ...img, inUse: true } : img)))
        placedCount++
      }
    }

    // Show toast with results
    const remainingCount = unusedImages.length - placedCount

    if (remainingCount > 0) {
      toast({
        title: `${placedCount} image${placedCount !== 1 ? "s" : ""} placed`,
        description: `${remainingCount} image${remainingCount !== 1 ? "s" : ""} couldn't fit. Add more cells to place the remaining images.`,
        duration: 3000,
      })
    } else {
      toast({
        title: `${placedCount} image${placedCount !== 1 ? "s" : ""} placed successfully`,
        duration: 2000,
      })
    }
  }, [trayImages, emptyPositions, addBox, toast, templatePlaceholders, getOccupiedPositions])

  // Update the handleAddToEmptyCell function
  const handleAddToEmptyCell = useCallback(
    (position: number, imageUrl?: string) => {
      if (imageUrl) {
        // Directly add to the grid and let addBox handle tray management
        addBox(position, imageUrl)
      } else {
        // For clicks, we'll let the EmptyCell component handle the file input directly
        console.log("Empty cell clicked at position:", position)
      }
    },
    [addBox],
  )

  // Function to handle multi-image upload
  const handleMultiUpload = useCallback(
    (files?: FileList) => {
      if (files) {
        // If files are provided, add them directly to the tray
        handleAddImagesToTray(files)
      } else {
        // Legacy behavior for backward compatibility
        setUploadPosition(null)
        setIsMultiUpload(true)
        setIsUploaderOpen(true)
      }
    },
    [handleAddImagesToTray],
  )

  // Function to handle image upload for the selected box
  const handleImageUpload = useCallback((id: string) => {
    // Set the selected box ID and open the uploader
    setSelectedBoxId(id)
    setIsMultiUpload(false)
    setIsUploaderOpen(true)
  }, [])

  // Enhanced function to expand a box with position change support
  const expandBox = useCallback(
    (id: string, newRowSpan: number, newColSpan: number, newPosition?: number) => {
      setBoxes((prevBoxes) => {
        return prevBoxes.map((box) => {
          if (box.id !== id) return box

          // Use the new position if provided, otherwise use the current position
          const position = newPosition !== undefined ? newPosition : box.position
          const startRow = Math.floor(position / columns)
          const startCol = position % columns

          // Check if expansion would go out of bounds
          if (startRow + newRowSpan > rows || startCol + newColSpan > columns) {
            return box
          }

          // Check if expansion would overlap other boxes
          const occupied = getOccupiedPositions()

          // Remove the current box's position from occupied
          const currentStartRow = Math.floor(box.position / columns)
          const currentStartCol = box.position % columns
          for (let r = 0; r < box.rowSpan; r++) {
            for (let c = 0; c < box.colSpan; c++) {
              const pos = (currentStartRow + r) * columns + (currentStartCol + c)
              occupied.delete(pos)
            }
          }

          // Check if expanded area is free
          for (let r = 0; r < newRowSpan; r++) {
            for (let c = 0; c < newColSpan; c++) {
              const pos = (startRow + r) * columns + (startCol + c)
              if (occupied.has(pos) && occupied.get(pos) !== box.id) {
                return box // Position is occupied by another box
              }
            }
          }

          return {
            ...box,
            position,
            rowSpan: newRowSpan,
            colSpan: newColSpan,
          }
        })
      })
    },
    [columns, rows, getOccupiedPositions],
  )

  // Function to update box image
  const updateBoxImage = useCallback((id: string, imageUrl: string) => {
    setBoxes((prevBoxes) => {
      return prevBoxes.map((box) => {
        if (box.id !== id) return box
        return {
          ...box,
          imageUrl,
        }
      })
    })
    toast({
      title: "Image updated",
      description: "The image has been updated successfully",
      duration: TOAST_DURATION,
    })
  }, [])

  // Reset grid to default settings
  const resetGrid = useCallback(() => {
    setRows(2)
    setColumns(2)
    setGridWidth(800)
    setGridHeight(600)
    setCellSize(100)
    setGridGap(10)
    setBoxes([])
    setTemplatePlaceholders([])
    setSelectedBoxId(null)
    setManualZoom(null)
    lastAppliedTemplate.current = null
    toast({
      title: "Grid reset",
      description: "The grid has been reset to default settings",
      duration: TOAST_DURATION,
    })
  }, [])

  // Apply a layout template
  const applyTemplate = useCallback(
    (template: LayoutTemplate) => {
      // Store the template for reference
      lastAppliedTemplate.current = template

      // Update grid dimensions
      setRows(template.rows)
      setColumns(template.columns)

      // Create new boxes based on the template layout
      const existingBoxes = [...boxes]
      const imagesToUse = existingBoxes.slice(0, Math.min(existingBoxes.length, template.imageCount))

      // Create the new boxes array based on the template
      const updatedBoxes = imagesToUse.map((box, index) => {
        const templateItem = template.layout[index]
        return {
          ...box,
          position: templateItem.position,
          rowSpan: templateItem.rowSpan,
          colSpan: templateItem.colSpan,
        }
      })

      // Create template placeholders for empty slots
      const newPlaceholders: TemplatePlaceholder[] = []
      if (imagesToUse.length < template.imageCount) {
        for (let i = imagesToUse.length; i < template.imageCount; i++) {
          const templateItem = template.layout[i]
          newPlaceholders.push({
            position: templateItem.position,
            rowSpan: templateItem.rowSpan,
            colSpan: templateItem.colSpan,
            templateId: template.id, // Store the template ID
            templateName: template.name, // Store the template name
          })
        }
      }

      // If we have more images than the template needs, move them to the tray
      if (existingBoxes.length > template.imageCount) {
        const extraImages = existingBoxes.slice(template.imageCount)

        // Track which image URLs are being removed from the grid
        const removedImageUrls = new Set(extraImages.map((img) => img.imageUrl))

        // Track which image URLs are still in the grid
        const remainingImageUrls = new Set(updatedBoxes.map((img) => img.imageUrl))

        // Add the extra images to the tray and update inUse status for all tray images
        setTrayImages((prevTrayImages) => {
          const newTrayImages = [...prevTrayImages]

          // First, add any extra images to the tray if they're not already there
          extraImages.forEach((image) => {
            // Check if this image is already in the tray
            const existingIndex = newTrayImages.findIndex((trayImage) => trayImage.url === image.imageUrl)

            if (existingIndex === -1) {
              // Add to tray if not already there
              newTrayImages.push({
                id: image.id,
                url: image.imageUrl,
                inUse: false, // Mark as not in use since it's being removed from the grid
                content: image.content,
              })
            }
          })

          // Now update the inUse status for all tray images based on what's in the grid
          return newTrayImages.map((trayImage) => ({
            ...trayImage,
            inUse: remainingImageUrls.has(trayImage.url),
          }))
        })

        toast({
          title: "Images moved to tray",
          description: `${extraImages.length} image${extraImages.length !== 1 ? "s" : ""} moved to your photo tray`,
          duration: TOAST_DURATION,
        })
      } else {
        // Even if we don't have extra images, we still need to update the inUse status
        // for all tray images based on what's in the grid
        const remainingImageUrls = new Set(updatedBoxes.map((img) => img.imageUrl))

        setTrayImages((prevTrayImages) => {
          return prevTrayImages.map((trayImage) => ({
            ...trayImage,
            inUse: remainingImageUrls.has(trayImage.url),
          }))
        })
      }

      setBoxes(updatedBoxes)
      setTemplatePlaceholders(newPlaceholders)

      const placeholderCount = Math.max(0, template.imageCount - existingBoxes.length)

      if (placeholderCount > 0) {
        toast({
          title: "Template applied with placeholders",
          description: `Applied the "${template.name}" template with ${placeholderCount} empty placeholder${
            placeholderCount !== 1 ? "s" : ""
          }. Click on each placeholder to add an image.`,
          duration: TOAST_DURATION,
        })
      } else {
        toast({
          title: "Template applied",
          description: `Applied the "${template.name}" template to your images.`,
          duration: TOAST_DURATION,
        })
      }

      // If there are placeholders, we can suggest using the Place All button
      if (newPlaceholders.length > 0) {
        toast({
          title: "Template applied with placeholders",
          description: `Click 'Place All' to automatically fill the placeholders with images from your tray.`,
          duration: TOAST_DURATION,
        })
      }
    },
    [boxes, toast],
  )

  // Apply a size preset
  const applySizePreset = useCallback(
    (preset: SizePreset) => {
      // Apply the exact dimensions from the preset without any modifications
      setGridWidth(preset.width)
      setGridHeight(preset.height)

      // Adjust cell size to fit the new dimensions
      const newCellSize = Math.max(
        50,
        Math.min(200, Math.floor(Math.min(preset.width / columns, preset.height / rows) / 1.5)),
      )
      setCellSize(newCellSize)

      toast({
        title: "Aspect ratio applied",
        description: `Applied the ${preset.ratio} aspect ratio (${preset.width}×${preset.height})`,
        duration: TOAST_DURATION,
      })
    },
    [columns, rows, toast],
  )

  // Function to switch orientation (swap width and height)
  const switchOrientation = useCallback(() => {
    // Swap width and height
    const newWidth = gridHeight
    const newHeight = gridWidth

    setGridWidth(newWidth)
    setGridHeight(newHeight)

    toast({
      title: "Orientation switched",
      description: `Changed orientation to ${newWidth > newHeight ? "landscape" : "portrait"} (${newWidth}×${newHeight})`,
      duration: TOAST_DURATION,
    })
  }, [gridWidth, gridHeight, toast])

  // Calculate empty positions and cell dimensions
  const emptyPositionsArray = emptyPositions()
  const cellDimensions = calculateCellDimensions(gridWidth, gridHeight, columns, rows, gridGap)

  // Get the selected box
  const selectedBox = selectedBoxId ? boxes.find((box) => box.id === selectedBoxId) : null

  // Handle click outside boxes to deselect
  const handleGridClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the grid container, not on a child
    if (e.target === e.currentTarget) {
      setSelectedBoxId(null)
    }
  }

  // Handle image uploader close
  const handleUploaderClose = () => {
    setIsUploaderOpen(false)
    setUploadPosition(null)
    setIsMultiUpload(false)
  }

  // Handle image selection from uploader
  const handleImageSelect = (imageUrl: string) => {
    if (uploadPosition !== null) {
      // Adding a new image to an empty cell
      addBox(uploadPosition, imageUrl)
      setUploadPosition(null)
    } else if (selectedBoxId) {
      // Updating an existing image
      updateBoxImage(selectedBoxId, imageUrl)
    } else {
      // If no position or box is selected, add to tray
      const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9)
      setTrayImages((prev) => [
        ...prev,
        {
          id: newId,
          url: imageUrl,
          inUse: false,
          content: `Image ${newId.slice(-3)}`,
        },
      ])

      toast({
        title: "Image added to tray",
        description: "The image has been added to your photo tray",
        duration: TOAST_DURATION,
      })
    }
    setIsUploaderOpen(false)
  }

  // Updated handleMultiImageSelect function with enhanced template selection logic
  const handleMultiImageSelect = (imageUrls: string[]) => {
    // Check if the grid is empty (no existing boxes) and this is a fresh upload from header
    const isEmptyGrid = boxes.length === 0

    // Check if the current layout has the same number of photos as being uploaded
    const isSamePhotoCount = boxes.length === imageUrls.length

    // Auto-apply template if grid is empty and we're not filling template placeholders
    // BUT don't apply a template if the current layout already has the same number of photos
    if (isEmptyGrid && templatePlaceholders.length === 0 && imageUrls.length >= 2 && imageUrls.length <= 6) {
      // Find a suitable template for the number of images
      const suitableTemplates = LAYOUT_TEMPLATES.filter((template) => template.imageCount === imageUrls.length)

      if (suitableTemplates.length > 0) {
        // Choose the first template that matches the image count
        const selectedTemplate = suitableTemplates[0]

        // Apply the template
        setRows(selectedTemplate.rows)
        setColumns(selectedTemplate.columns)

        // Create boxes based on the template layout
        const newBoxes = imageUrls.map((url, index) => {
          const templateItem = selectedTemplate.layout[index]
          const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9) + index

          return {
            id: newId,
            content: `Image ${newId.slice(-3)}`,
            color: getRandomColor(),
            imageUrl: url,
            position: templateItem.position,
            rowSpan: templateItem.rowSpan,
            colSpan: templateItem.colSpan,
          }
        })

        setBoxes(newBoxes)

        // Store the template for reference
        lastAppliedTemplate.current = selectedTemplate

        toast({
          title: "Template automatically applied",
          description: `Applied the "${selectedTemplate.name}" template to your ${imageUrls.length} images.`,
          duration: TOAST_DURATION,
        })

        setIsUploaderOpen(false)
        setIsMultiUpload(false)
        return
      }
    } else if (!isEmptyGrid && isSamePhotoCount && boxes.length > 0) {
      // If we have the same number of photos, just replace the existing images
      // but keep the current layout

      setBoxes((prevBoxes) => {
        return prevBoxes.map((box, index) => {
          // Make sure we don't go out of bounds with the imageUrls array
          if (index < imageUrls.length) {
            return {
              ...box,
              imageUrl: imageUrls[index],
            }
          }
          return box
        })
      })

      toast({
        title: "Images updated",
        description: `Updated ${imageUrls.length} images while preserving your current layout.`,
        duration: TOAST_DURATION,
      })

      setIsUploaderOpen(false)
      setIsMultiUpload(false)
      return
    }

    // If we can't auto-apply a template or shouldn't, use the existing logic
    // First try to fill template placeholders
    let remainingImages = [...imageUrls]

    if (templatePlaceholders.length > 0) {
      const placeholdersToFill = templatePlaceholders.slice(0, remainingImages.length)

      placeholdersToFill.forEach((placeholder, index) => {
        addBox(placeholder.position, remainingImages[index])
      })

      remainingImages = remainingImages.slice(placeholdersToFill.length)
    }

    // If we still have images, add them to empty cells
    if (remainingImages.length > 0) {
      const availablePositions = emptyPositionsArray.slice(0, remainingImages.length)

      availablePositions.forEach((position, index) => {
        addBox(position, remainingImages[index])
      })
    }

    toast({
      title: "Images added",
      description: `Added ${imageUrls.length} images to the grid`,
      duration: TOAST_DURATION,
    })

    setIsUploaderOpen(false)
    setIsMultiUpload(false)
  }

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setManualZoom((prev) => {
      const currentZoom = prev !== null ? prev : scale
      return Math.min(currentZoom + 0.1, 1)
    })
  }, [scale])

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setManualZoom((prev) => {
      const currentZoom = prev !== null ? prev : scale
      return Math.max(currentZoom - 0.1, 0.2)
    })
  }, [scale])

  // Handle zoom reset
  const handleZoomReset = useCallback(() => {
    setManualZoom(null)
  }, [])

  // Handle fit to view with improved centering
  const handleFitToView = useCallback(() => {
    if (!canvasContainerRef.current || !gridWrapperRef.current || !gridContainerRef.current) return

    const containerRect = canvasContainerRef.current.getBoundingClientRect()

    // Calculate desired padding (5% of container size or minimum 20px)
    const paddingX = Math.max(20, containerRect.width * 0.05)
    const paddingY = Math.max(20, containerRect.height * 0.05)

    // Available space accounting for padding
    const availableWidth = containerRect.width - paddingX * 2
    const availableHeight = containerRect.height - paddingY * 2

    // Calculate scale factors for width and height
    const widthScale = availableWidth / gridWidth
    const heightScale = availableHeight / gridHeight

    // Use the smaller scale factor to ensure the entire grid fits
    const fitScale = Math.min(widthScale, heightScale, 1)

    // Set the manual zoom to trigger the useEffect
    setManualZoom(fitScale)

    // Manually center the grid immediately to avoid any delay
    const wrapperElement = gridWrapperRef.current
    const gridElement = gridContainerRef.current
    const scaledWidth = gridWidth * fitScale
    const scaledHeight = gridHeight * fitScale
    const leftPosition = Math.round((containerRect.width - scaledWidth) / 2)
    const topPosition = Math.round((containerRect.height - scaledHeight) / 2)

    // Apply the centered position with direct positioning instead of transform
    wrapperElement.style.transform = "none" // Remove any transform
    wrapperElement.style.left = `${leftPosition}px`
    wrapperElement.style.top = `${topPosition}px`

    // Reset pan position
    setPanPosition({ x: leftPosition, y: topPosition })
    setInitialPanPosition({ x: leftPosition, y: topPosition })

    toast({
      title: "Fit to view",
      description: "Grid scaled to fit the available space",
      duration: TOAST_DURATION,
    })
  }, [gridWidth, gridHeight, toast])

  // Handle reset to 100% zoom
  const handleResetZoom = useCallback(() => {
    setManualZoom(1)

    // Center the grid at 100% zoom
    if (!canvasContainerRef.current || !gridWrapperRef.current) return

    const containerRect = canvasContainerRef.current.getBoundingClientRect()
    const wrapperElement = gridWrapperRef.current

    const leftPosition = Math.round((containerRect.width - gridWidth) / 2)
    const topPosition = Math.round((containerRect.height - gridHeight) / 2)

    // Apply the centered position with direct positioning
    wrapperElement.style.transform = "none"
    wrapperElement.style.left = `${leftPosition}px`
    wrapperElement.style.top = `${topPosition}px`

    // Reset pan position
    setPanPosition({ x: leftPosition, y: topPosition })
    setInitialPanPosition({ x: leftPosition, y: topPosition })

    toast({
      title: "Zoom reset to 100%",
      description: "Grid is displayed at actual size",
      duration: TOAST_DURATION,
    })
  }, [gridWidth, gridHeight, toast])

  // Generate grid template styles
  // Update the gridStyle object to use the roundedCorners state
  const gridStyle = {
    display: "grid !important",
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${columns}, minmax(30px, 1fr))`,
    gap: `${gridGap}px !important`, // Ensure gap is explicitly set with !important
    padding: "20px", // Use consistent padding on all sides
    backgroundColor: "#ffffff",
    borderRadius: "0px", // Fixed value, no longer using cornerRadius
    width: `${gridWidth}px`,
    height: `${gridHeight}px`,
    transform: `scale(${scale})`,
    transformOrigin: "0 0", // Set to top left for consistent positioning
    transition: "transform 0.2s ease-out, gap 0.3s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box", // Ensure box sizing is consistent
    overflow: "visible", // Ensure resize handles are visible
    position: "relative", // Ensure proper stacking context
  }

  // Add this useEffect to check if panning is possible whenever relevant values change
  useEffect(() => {
    if (canvasContainerRef.current && gridWrapperRef.current) {
      const containerRect = canvasContainerRef.current.getBoundingClientRect()
      const gridRect = gridWrapperRef.current.getBoundingClientRect()
      const isGridLargerThanViewport = gridRect.width > containerRect.width || gridRect.height > containerRect.height

      setCanPan(scale < 1 || isGridLargerThanViewport)
    }
  }, [scale, gridWidth, gridHeight, panPosition])

  // Add this useEffect to call fit to view on initial load
  useEffect(() => {
    // Wait for the component to fully render before fitting to view
    const timer = setTimeout(() => {
      handleFitToView()
    }, 300)

    return () => clearTimeout(timer)
  }, [handleFitToView])

  // Function to handle image selection for the selected box
  const handleSelectImage = useCallback((id: string) => {
    // Set the selected box ID and open the uploader
    setSelectedBoxId(id)
    setIsMultiUpload(false)
    setIsUploaderOpen(true)
  }, [])

  // Calculate cell dimensions
  const cellWidth = cellDimensions.width
  const cellHeight = cellDimensions.height

  // Determine if panning should be enabled based on cursor position and space key
  const shouldEnablePanning = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // If cursor is outside the grid (on canvas background), always allow panning
      if (!cursorOverGrid) {
        return true
      }

      // If cursor is over the grid, only allow panning when space is pressed
      return isSpacePressed
    },
    [cursorOverGrid, isSpacePressed],
  )

  // Pan handlers with improved logic
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return

      // Check if panning should be enabled
      if (!shouldEnablePanning(e)) return

      if (gridWrapperRef.current && canvasContainerRef.current) {
        // Check if the grid is larger than the viewport or if we're zoomed out
        const containerRect = canvasContainerRef.current.getBoundingClientRect()
        const gridRect = gridWrapperRef.current.getBoundingClientRect()
        const isGridLargerThanViewport = gridRect.width > containerRect.width || gridRect.height > containerRect.height

        // Allow panning if we're zoomed out (scale < 1) OR if the grid is larger than the viewport
        if (scale < 1 || isGridLargerThanViewport) {
          setIsPanning(true)
          setPanStart({ x: e.clientX, y: e.clientY })
          setInitialPanPosition({ ...panPosition })

          // Change cursor to indicate panning
          if (canvasContainerRef.current) {
            canvasContainerRef.current.style.cursor = "grabbing"
          }

          // Prevent default to avoid text selection during panning
          e.preventDefault()
        }
      }
    },
    [scale, panPosition, shouldEnablePanning],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && gridWrapperRef.current) {
        const deltaX = e.clientX - panStart.x
        const deltaY = e.clientY - panStart.y

        const newX = initialPanPosition.x + deltaX
        const newY = initialPanPosition.y + deltaY

        // Update the grid wrapper position
        gridWrapperRef.current.style.left = `${newX}px`
        gridWrapperRef.current.style.top = `${newY}px`

        // Update state to keep track of position
        setPanPosition({ x: newX, y: newY })
      }
    },
    [isPanning, panStart, initialPanPosition],
  )

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)

      // Reset cursor
      if (canvasContainerRef.current) {
        canvasContainerRef.current.style.cursor = "default"
      }
    }
  }, [isPanning])

  // Touch event handlers for mobile devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return

      // Check if panning should be enabled
      if (!shouldEnablePanning(e)) return

      if (gridWrapperRef.current && canvasContainerRef.current) {
        // Check if the grid is larger than the viewport or if we're zoomed out
        const containerRect = canvasContainerRef.current.getBoundingClientRect()
        const gridRect = gridWrapperRef.current.getBoundingClientRect()
        const isGridLargerThanViewport = gridRect.width > containerRect.width || gridRect.height > containerRect.height

        // Allow panning if we're zoomed out (scale < 1) OR if the grid is larger than the viewport
        if (scale < 1 || isGridLargerThanViewport) {
          setIsPanning(true)
          setPanStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          })
          setInitialPanPosition({ ...panPosition })

          // Prevent default to avoid scrolling the page
          e.preventDefault()
        }
      }
    },
    [scale, panPosition, shouldEnablePanning],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isPanning && gridWrapperRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - panStart.x
        const deltaY = e.touches[0].clientY - panStart.y

        const newX = initialPanPosition.x + deltaX
        const newY = initialPanPosition.y + deltaY

        // Update the grid wrapper position
        gridWrapperRef.current.style.left = `${newX}px`
        gridWrapperRef.current.style.top = `${newY}px`

        // Update state to keep track of position
        setPanPosition({ x: newX, y: newY })

        // Prevent default to avoid scrolling the page
        e.preventDefault()
      }
    },
    [isPanning, panStart, initialPanPosition],
  )

  const handleTouchEnd = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
    }
  }, [isPanning])

  // Handle mouse enter/leave for grid to track cursor position
  const handleGridMouseEnter = useCallback(() => {
    setCursorOverGrid(true)
  }, [])

  const handleGridMouseLeave = useCallback(() => {
    setCursorOverGrid(false)
  }, [])

  // Determine cursor style based on current state
  const getCursorStyle = () => {
    if (isPanning) return "grabbing"
    if (cursorOverGrid && isSpacePressed) return "grab"
    if (!cursorOverGrid && canPan) return "grab"
    return "default"
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Main app container using CSS Grid for layout */}
      <style jsx global>{`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .photo-tray {
    max-width: 100%; /* Full width now that sidebar is removed */
  }
  .row-controls {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }
  .grid-wrapper {
    transition: margin 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute; /* Add absolute positioning */
  }
  .canvas-container {
    cursor: ${getCursorStyle()};
  }
  .photo-tray-container {
    width: 100%;
    position: relative;
    border-top: 1px solid #e5e7eb;
    background-color: white;
    z-index: 10;
  }
  
  /* Show space bar hint when hovering over grid */
  .space-hint {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
    opacity: ${cursorOverGrid && !isSpacePressed ? "1" : "0"};
    transition: opacity 0.2s ease;
  }
`}</style>
      {/* Main app container */}
      <div className="app-container">
        {/* Header - fixed at the top, full width */}
        <header className="app-header">
          <Navigation
            gridRef={gridContainerRef}
            gridData={{
              rows,
              columns,
              gridWidth,
              gridHeight,
              gridGap,
              boxes,
            }}
            onAddImages={handleAddImagesToTray}
            emptyCount={emptyPositionsArray.length + templatePlaceholders.length}
          />
        </header>

        {/* Main content area - contains topbar, sidebar, and canvas */}
        <div className="app-content">
          <div className="corner"></div>
          <Topbar
            columns={columns}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
            gridGap={gridGap}
            cornerRadius={cornerRadius}
            scale={scale}
            manualZoom={manualZoom}
            widthInputValue={widthInputValue}
            heightInputValue={heightInputValue}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onWidthInputChange={setWidthInputValue}
            onHeightInputChange={setHeightInputValue}
            onWidthInputBlur={() => {
              const value = Number.parseInt(widthInputValue)
              if (!isNaN(value) && value >= 400 && value <= 2100) {
                updateGridDimensions(rows, columns, value, gridHeight)
              } else {
                setWidthInputValue(gridWidth.toString())
              }
            }}
            onHeightInputBlur={() => {
              const value = Number.parseInt(heightInputValue)
              if (!isNaN(value) && value >= 300 && value <= 2100) {
                updateGridDimensions(rows, columns, gridWidth, value)
              } else {
                setHeightInputValue(gridHeight.toString())
              }
            }}
            onWidthInputKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") {
                e.preventDefault()
                const value = Number.parseInt(widthInputValue)
                if (!isNaN(value) && value >= 400 && value <= 2100) {
                  updateGridDimensions(rows, columns, value, gridHeight)
                } else {
                  setWidthInputValue(gridWidth.toString())
                }
                e.currentTarget.blur()
              }
            }}
            onHeightInputKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") {
                e.preventDefault()
                const value = Number.parseInt(heightInputValue)
                if (!isNaN(value) && value >= 300 && value <= 2100) {
                  updateGridDimensions(rows, columns, gridWidth, value)
                } else {
                  setHeightInputValue(gridHeight.toString())
                }
                e.currentTarget.blur()
              }
            }}
            onInputClick={(e) => {
              e.stopPropagation()
              e.currentTarget.select()
            }}
            applySizePreset={applySizePreset}
            applyTemplate={applyTemplate}
            updateGridGap={updateGridGap}
            setCornerRadius={setCornerRadius}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToView={handleFitToView}
            onResetZoom={handleResetZoom}
            boxesLength={boxes.length}
          />

          {/* Sidebar - contains row controls */}
          <Sidebar rows={rows} onAddRow={addRow} onRemoveRow={removeRow} />

          {/* Canvas container - scrollable area for the grid */}
          <div
            ref={canvasContainerRef}
            className="canvas-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={gridWrapperRef} className="grid-wrapper">
              {/* Grid container */}
              <div
                className="grid-container"
                ref={gridContainerRef}
                style={gridStyle}
                onClick={handleGridClick}
                onMouseEnter={handleGridMouseEnter}
                onMouseLeave={handleGridMouseLeave}
              >
                {/* Empty cell placeholders with drop targets */}
                {emptyPositionsArray.map((position) => (
                  <EmptyCell
                    key={`empty-${position}`}
                    position={position}
                    addBox={handleAddToEmptyCell}
                    moveBoxToPosition={moveBoxToPosition}
                    totalColumns={columns}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    scale={scale}
                    cornerRadius={cornerRadius}
                    addToTray={addImageToTray}
                  />
                ))}

                {/* Template placeholders */}
                {templatePlaceholders.map((placeholder) => (
                  <TemplateCell
                    key={`template-${placeholder.position}`}
                    position={placeholder.position}
                    addBox={handleAddToEmptyCell}
                    moveBoxToPosition={moveBoxToPosition}
                    totalColumns={columns}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    rowSpan={placeholder.rowSpan}
                    colSpan={placeholder.colSpan}
                    scale={scale}
                    cornerRadius={cornerRadius}
                    templateName={placeholder.templateName || ""}
                    addToTray={addImageToTray}
                  />
                ))}

                {/* Boxes (images) - rendered last to appear on top */}
                {boxes.map((box) => (
                  <Box
                    key={box.id}
                    id={box.id}
                    index={box.position}
                    content={box.content}
                    color={box.color || "bg-gray-100"}
                    imageUrl={box.imageUrl}
                    rowSpan={box.rowSpan}
                    colSpan={box.colSpan}
                    totalColumns={columns}
                    moveBox={moveBox}
                    deleteBox={deleteBox}
                    expandBox={expandBox}
                    swapBoxes={swapBoxes}
                    onChangeImage={(id) => handleSelectImage(id)}
                    isSelected={selectedBoxId === box.id}
                    onSelect={setSelectedBoxId}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    cornerRadius={cornerRadius}
                    scale={scale}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Space bar hint */}
        <div className="space-hint">Hold SPACE + drag to pan the canvas</div>

        {/* Image uploader dialog */}
        {isUploaderOpen && (
          <ImageUploader
            isOpen={isUploaderOpen}
            onClose={handleUploaderClose}
            onImageSelect={handleImageSelect}
            onMultiImageSelect={handleMultiImageSelect}
            currentImageUrl={selectedBoxId ? selectedBox?.imageUrl || "" : ""}
            isNewImage={uploadPosition !== null}
            isMultiUpload={isMultiUpload}
          />
        )}

        {/* Photo Tray - now part of the main layout flow */}
        <PhotoTray
          images={trayImages}
          onAddToGrid={addImageFromTray}
          onRemoveFromTray={removeImageFromTray}
          onClearTray={clearTray}
          onAddImages={handleAddImagesToTray}
          onPlaceAll={placeAllImages}
          deleteBox={deleteBox}
        />
      </div>
    </DndProvider>
  )
}
