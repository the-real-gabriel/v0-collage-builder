"use client"

import { useDrop, type DropTargetMonitor } from "react-dnd"
import { useCallback } from "react"

/**
 * Custom hook for creating drop targets
 * @param acceptTypes - Array of item types that can be dropped
 * @param handler - Function to handle the drop event
 * @param canDropFn - Function or boolean to determine if an item can be dropped
 */
export function useDropTarget(
  acceptTypes: string[],
  handler: (item: any) => void,
  canDropFn?: boolean | ((item: any) => boolean),
) {
  // Memoize the drop handler to prevent unnecessary re-renders
  const handleDrop = useCallback(
    (item: any, monitor: DropTargetMonitor) => {
      if (monitor.canDrop() && monitor.isOver({ shallow: true })) {
        return handler(item)
      }
      return undefined
    },
    [handler],
  )

  // Create a proper canDrop function based on the input
  const canDropFunction = useCallback(
    (item: any) => {
      if (typeof canDropFn === "function") {
        return canDropFn(item)
      }
      return canDropFn !== false // true by default unless explicitly set to false
    },
    [canDropFn],
  )

  const [collectedProps, drop] = useDrop({
    accept: acceptTypes,
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: canDropFunction,
  })

  return [collectedProps, drop]
}
