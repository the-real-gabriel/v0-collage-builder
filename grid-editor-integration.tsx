"use client"

import { useRef } from "react"

import { forwardRef, useImperativeHandle } from "react"
import GridEditor from "@/grid-editor"

// This component wraps the original GridEditor and exposes methods to access its state
const GridEditorIntegration = forwardRef((props, ref) => {
  // Create a ref to the original grid editor
  const gridEditorRef = useRef(null)

  // Expose methods to access the grid editor's state
  useImperativeHandle(ref, () => ({
    // Grid state getters
    getRows: () => gridEditorRef.current?.rows || 2,
    getColumns: () => gridEditorRef.current?.columns || 2,
    getGridWidth: () => gridEditorRef.current?.gridWidth || 800,
    getGridHeight: () => gridEditorRef.current?.gridHeight || 600,
    getGridGap: () => gridEditorRef.current?.gridGap || 10,
    getCornerRadius: () => gridEditorRef.current?.cornerRadius || 0,

    // Grid state setters
    setRows: (rows) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setRows(rows)
      }
    },
    setColumns: (columns) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setColumns(columns)
      }
    },
    setGridWidth: (width) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setGridWidth(width)
      }
    },
    setGridHeight: (height) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setGridHeight(height)
      }
    },
    setGridGap: (gap) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setGridGap(gap)
      }
    },
    setCornerRadius: (radius) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setCornerRadius(radius)
      }
    },

    // Box getters and setters
    getBoxes: () => gridEditorRef.current?.boxes || [],
    setBoxes: (boxes) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setBoxes(boxes)
      }
    },

    // Tray image getters and setters
    getTrayImages: () => gridEditorRef.current?.trayImages || [],
    setTrayImages: (images) => {
      if (gridEditorRef.current) {
        gridEditorRef.current.setTrayImages(images)
      }
    },
  }))

  return <GridEditor ref={gridEditorRef} {...props} />
})

GridEditorIntegration.displayName = "GridEditorIntegration"

export default GridEditorIntegration
