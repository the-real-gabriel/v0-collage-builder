/**
 * Utility functions for grid operations
 */

/**
 * Calculate and format aspect ratio from width and height
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

  const divisor = gcd(width, height)
  const simplifiedWidth = width / divisor
  const simplifiedHeight = height / divisor

  // If the simplified ratio has large numbers, return decimal format
  if (simplifiedWidth > 20 || simplifiedHeight > 20) {
    return (width / height).toFixed(2) + ":1"
  }

  return `${simplifiedWidth}:${simplifiedHeight}`
}

/**
 * Generate a random color from a predefined palette
 */
export function getRandomColor() {
  const colors = [
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-red-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-teal-200",
    "bg-orange-200",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Calculate cell dimensions based on grid size and number of cells
 */
export function calculateCellDimensions(
  gridWidth: number,
  gridHeight: number,
  columns: number,
  rows: number,
  gridGap: number,
) {
  // Calculate available space for cells (grid size minus gaps)
  const availableWidth = gridWidth - gridGap * (columns - 1)
  const availableHeight = gridHeight - gridGap * (rows - 1)

  // Calculate cell dimensions to fit the grid
  const calculatedCellWidth = availableWidth / columns
  const calculatedCellHeight = availableHeight / rows

  return {
    width: calculatedCellWidth,
    height: calculatedCellHeight,
  }
}

/**
 * Set CSS variables for grid styling
 */
export function setCSSVariables(
  gridGap: number,
  cornerRadius: number,
  scale: number,
  rows?: number,
  columns?: number,
  gridWidth?: number,
  gridHeight?: number,
) {
  document.documentElement.style.setProperty("--grid-gap", `${gridGap}px`)
  document.documentElement.style.setProperty("--corner-radius", `${cornerRadius}px`)
  document.documentElement.style.setProperty("--current-scale", `${scale}`)

  if (rows) document.documentElement.style.setProperty("--grid-rows", `${rows}`)
  if (columns) document.documentElement.style.setProperty("--grid-columns", `${columns}`)
  if (gridWidth) document.documentElement.style.setProperty("--grid-width", `${gridWidth}px`)
  if (gridHeight) document.documentElement.style.setProperty("--grid-height", `${gridHeight}px`)
}

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false

  // Check if it's a data URL
  if (url.startsWith("data:")) return true

  // Check if it's a blob URL
  if (url.startsWith("blob:")) return true

  // Check if it's a relative URL
  if (url.startsWith("/")) return true

  // Check if it's an absolute URL with http/https
  if (url.startsWith("http://") || url.startsWith("https://")) return true

  return false
}

/**
 * Generate a unique ID for a box
 */
export function generateBoxId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9)
}

/**
 * Check if a position is within grid bounds
 */
export function isWithinGridBounds(
  position: number,
  rowSpan: number,
  colSpan: number,
  rows: number,
  columns: number,
): boolean {
  const startRow = Math.floor(position / columns)
  const startCol = position % columns

  return startRow + rowSpan <= rows && startCol + colSpan <= columns
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}
