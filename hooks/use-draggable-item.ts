"use client"

import { useDrag } from "react-dnd"
import { useMemo } from "react"

/**
 * Custom hook for creating draggable items
 * @param id - Unique identifier for the item
 * @param type - Type of the draggable item
 * @param data - Additional data to include with the drag item
 * @param canDrag - Whether the item can be dragged
 */
export function useDraggableItem(id: string, type: string, data: any, canDrag = true) {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({ id, type, ...data }), [id, type, data])

  const [collected, drag] = useDrag(
    () => ({
      type,
      item: itemData,
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, type, canDrag, JSON.stringify(data)],
  )

  return [collected, drag]
}
