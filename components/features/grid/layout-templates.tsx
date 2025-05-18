"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"

// Define template interface for the new system
export interface LayoutTemplate {
  id: string
  name: string
  description: string
  imageCount: number
  gridRows: number
  gridColumns: number
  placeholders: {
    id: string
    name: string
    startRow: number
    startCol: number
    rowSpan: number
    colSpan: number
  }[]
  aspectRatio?: string
}

// Define templates for different numbers of images
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // 2 Image Templates
  {
    id: "2-horizontal-equal",
    name: "Horizontal Equal",
    description: "Two equal-sized images side by side",
    imageCount: 2,
    gridRows: 1,
    gridColumns: 2,
    placeholders: [
      { id: "left", name: "Horizontal Equal", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "right", name: "Horizontal Equal", startRow: 0, startCol: 1, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "2:1",
  },
  {
    id: "2-vertical-equal",
    name: "Vertical Equal",
    description: "Two equal-sized images stacked vertically",
    imageCount: 2,
    gridRows: 2,
    gridColumns: 1,
    placeholders: [
      { id: "top", name: "Vertical Equal", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom", name: "Vertical Equal", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "1:2",
  },
  {
    id: "2-left-feature",
    name: "Left Feature",
    description: "Large image on left, small on right",
    imageCount: 2,
    gridRows: 2,
    gridColumns: 3,
    placeholders: [
      { id: "left", name: "Left Feature", startRow: 0, startCol: 0, rowSpan: 2, colSpan: 2 },
      { id: "right", name: "Left Feature", startRow: 0, startCol: 2, rowSpan: 2, colSpan: 1 },
    ],
    aspectRatio: "3:2",
  },
  {
    id: "2-right-feature",
    name: "Right Feature",
    description: "Small image on left, large on right",
    imageCount: 2,
    gridRows: 2,
    gridColumns: 3,
    placeholders: [
      { id: "left", name: "Right Feature", startRow: 0, startCol: 0, rowSpan: 2, colSpan: 1 },
      { id: "right", name: "Right Feature", startRow: 0, startCol: 1, rowSpan: 2, colSpan: 2 },
    ],
    aspectRatio: "3:2",
  },
  {
    id: "2-top-feature",
    name: "Top Feature",
    description: "Large image on top, small below",
    imageCount: 2,
    gridRows: 3,
    gridColumns: 2,
    placeholders: [
      { id: "top", name: "Top Feature", startRow: 0, startCol: 0, rowSpan: 2, colSpan: 2 },
      { id: "bottom", name: "Top Feature", startRow: 2, startCol: 0, rowSpan: 1, colSpan: 2 },
    ],
    aspectRatio: "2:3",
  },

  // 3 Image Templates
  {
    id: "3-equal-row",
    name: "Equal Row",
    description: "Three equal images in a row",
    imageCount: 3,
    gridRows: 1,
    gridColumns: 3,
    placeholders: [
      { id: "left", name: "Equal Row", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "middle", name: "Equal Row", startRow: 0, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "right", name: "Equal Row", startRow: 0, startCol: 2, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "3:1",
  },
  {
    id: "3-left-stack",
    name: "Left Stack",
    description: "Two stacked images on left, one large on right",
    imageCount: 3,
    gridRows: 2,
    gridColumns: 2,
    placeholders: [
      { id: "top-left", name: "Left Stack", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-left", name: "Left Stack", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "right", name: "Left Stack", startRow: 0, startCol: 1, rowSpan: 2, colSpan: 1 },
    ],
    aspectRatio: "2:2",
  },
  {
    id: "3-top-feature",
    name: "Top Feature",
    description: "Large image on top, two small below",
    imageCount: 3,
    gridRows: 2,
    gridColumns: 2,
    placeholders: [
      { id: "top", name: "Top Feature", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 2 },
      { id: "bottom-left", name: "Top Feature", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Top Feature", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "2:2",
  },

  // 4 Image Templates
  {
    id: "4-grid",
    name: "Grid",
    description: "Four equal images in a grid",
    imageCount: 4,
    gridRows: 2,
    gridColumns: 2,
    placeholders: [
      { id: "top-left", name: "Grid", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "top-right", name: "Grid", startRow: 0, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "bottom-left", name: "Grid", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Grid", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "2:2",
  },
  {
    id: "4-feature-right",
    name: "Feature Right",
    description: "Three images on left, one large on right",
    imageCount: 4,
    gridRows: 3,
    gridColumns: 2,
    placeholders: [
      { id: "top-left", name: "Feature Right", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "middle-left", name: "Feature Right", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-left", name: "Feature Right", startRow: 2, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "right", name: "Feature Right", startRow: 0, startCol: 1, rowSpan: 3, colSpan: 1 },
    ],
    aspectRatio: "2:3",
  },
  {
    id: "4-feature-top",
    name: "Feature Top",
    description: "Large image on top with three below",
    imageCount: 4,
    gridRows: 2,
    gridColumns: 3,
    placeholders: [
      { id: "top", name: "Feature Top", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 3 },
      { id: "bottom-left", name: "Feature Top", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-middle", name: "Feature Top", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Feature Top", startRow: 1, startCol: 2, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "3:2",
  },

  // 5 Image Templates
  {
    id: "5-quilt",
    name: "Quilt",
    description: "Quilt-like arrangement with varied sizes",
    imageCount: 5,
    gridRows: 3,
    gridColumns: 3,
    placeholders: [
      { id: "large", name: "Quilt", startRow: 0, startCol: 0, rowSpan: 2, colSpan: 2 },
      { id: "top-right", name: "Quilt", startRow: 0, startCol: 2, rowSpan: 1, colSpan: 1 },
      { id: "middle-right", name: "Quilt", startRow: 1, startCol: 2, rowSpan: 1, colSpan: 1 },
      { id: "bottom-left", name: "Quilt", startRow: 2, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Quilt", startRow: 2, startCol: 1, rowSpan: 1, colSpan: 2 },
    ],
    aspectRatio: "3:3",
  },
  {
    id: "5-feature-left",
    name: "Feature Left",
    description: "Large image on left, four smaller on right",
    imageCount: 5,
    gridRows: 4,
    gridColumns: 2,
    placeholders: [
      { id: "left", name: "Feature Left", startRow: 0, startCol: 0, rowSpan: 4, colSpan: 1 },
      { id: "top-right", name: "Feature Left", startRow: 0, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "upper-middle-right", name: "Feature Left", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "lower-middle-right", name: "Feature Left", startRow: 2, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Feature Left", startRow: 3, startCol: 1, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "2:4",
  },

  // 6 Image Templates
  {
    id: "6-grid",
    name: "Grid",
    description: "Six images in a 3x2 grid",
    imageCount: 6,
    gridRows: 2,
    gridColumns: 3,
    placeholders: [
      { id: "top-left", name: "Grid", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "top-middle", name: "Grid", startRow: 0, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "top-right", name: "Grid", startRow: 0, startCol: 2, rowSpan: 1, colSpan: 1 },
      { id: "bottom-left", name: "Grid", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-middle", name: "Grid", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Grid", startRow: 1, startCol: 2, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "3:2",
  },
  {
    id: "6-panorama",
    name: "Panorama",
    description: "Wide panorama on top with five images below",
    imageCount: 6,
    gridRows: 2,
    gridColumns: 5,
    placeholders: [
      { id: "top", name: "Panorama", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 5 },
      { id: "bottom-1", name: "Panorama", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-2", name: "Panorama", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "bottom-3", name: "Panorama", startRow: 1, startCol: 2, rowSpan: 1, colSpan: 1 },
      { id: "bottom-4", name: "Panorama", startRow: 1, startCol: 3, rowSpan: 1, colSpan: 1 },
      { id: "bottom-5", name: "Panorama", startRow: 1, startCol: 4, rowSpan: 1, colSpan: 1 },
    ],
    aspectRatio: "5:2",
  },
  {
    id: "6-feature-center",
    name: "Feature Center",
    description: "Large center image with five around it",
    imageCount: 6,
    gridRows: 3,
    gridColumns: 3,
    placeholders: [
      { id: "top", name: "Feature Center", startRow: 0, startCol: 0, rowSpan: 1, colSpan: 3 },
      { id: "middle-left", name: "Feature Center", startRow: 1, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "middle-center", name: "Feature Center", startRow: 1, startCol: 1, rowSpan: 1, colSpan: 1 },
      { id: "middle-right", name: "Feature Center", startRow: 1, startCol: 2, rowSpan: 1, colSpan: 1 },
      { id: "bottom-left", name: "Feature Center", startRow: 2, startCol: 0, rowSpan: 1, colSpan: 1 },
      { id: "bottom-right", name: "Feature Center", startRow: 2, startCol: 1, rowSpan: 1, colSpan: 2 },
    ],
    aspectRatio: "3:3",
  },
]

// Define a basic template for clearing the layout
export const CLEAR_TEMPLATE: LayoutTemplate = {
  id: "clear-template",
  name: "Clear Layout",
  description: "Reset to a basic grid layout",
  imageCount: 0,
  gridRows: 1,
  gridColumns: 1,
  placeholders: [],
}

interface LayoutTemplatesProps {
  onSelectTemplate: (template: LayoutTemplate) => void
  onClearLayout?: () => void
  currentImageCount: number
  compact?: boolean
}

export function LayoutTemplates({
  onSelectTemplate,
  onClearLayout,
  currentImageCount,
  compact = false,
}: LayoutTemplatesProps) {
  const [selectedImageCount, setSelectedImageCount] = useState<string>(
    currentImageCount >= 2 && currentImageCount <= 6 ? currentImageCount.toString() : "2",
  )

  // Filter templates by image count
  const filteredTemplates = LAYOUT_TEMPLATES.filter(
    (template) => template.imageCount === Number.parseInt(selectedImageCount),
  )

  // Handle clear layout
  const handleClearLayout = () => {
    if (onClearLayout) {
      onClearLayout()
    } else {
      onSelectTemplate(CLEAR_TEMPLATE)
    }
  }

  return (
    <div className="layout-templates space-y-4">
      <div className="flex items-center justify-between mb-6 pt-2">
        <label className="text-xs font-medium">Number of images:</label>
        <Select value={selectedImageCount} onValueChange={setSelectedImageCount}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper" align="end" sideOffset={5} alignOffset={0}>
            <SelectItem value="2">2 Images</SelectItem>
            <SelectItem value="3">3 Images</SelectItem>
            <SelectItem value="4">4 Images</SelectItem>
            <SelectItem value="5">5 Images</SelectItem>
            <SelectItem value="6">6 Images</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 mt-2">
        {/* Clear Layout Button */}
        <div
          className="border border-dashed border-black/20 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
          onClick={handleClearLayout}
        >
          <div className="flex items-center p-2">
            {/* Template preview */}
            <div
              className="bg-gray-100 rounded-md p-1 mr-3 flex-shrink-0 flex items-center justify-center"
              style={{
                width: "60px",
                height: "40px",
              }}
            >
              <RefreshCw className="h-5 w-5 text-black/40" />
            </div>

            {/* Template info */}
            <div className="flex-grow min-w-0">
              <h3 className="text-xs font-medium truncate">Clear Layout</h3>
              <p className="text-[10px] text-gray-500 truncate">Reset to a basic grid layout</p>
            </div>
          </div>
        </div>

        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-center p-2">
              {/* Template preview */}
              <div
                className="bg-gray-100 rounded-md p-1 mr-3 flex-shrink-0"
                style={{
                  width: "60px",
                  height: "40px",
                }}
              >
                <div
                  className="grid gap-1 h-full w-full"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${template.gridColumns}, 1fr)`,
                    gridTemplateRows: `repeat(${template.gridRows}, 1fr)`,
                  }}
                >
                  {template.placeholders.map((placeholder, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-200 rounded-sm"
                      style={{
                        gridRow: `${placeholder.startRow + 1} / span ${placeholder.rowSpan}`,
                        gridColumn: `${placeholder.startCol + 1} / span ${placeholder.colSpan}`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Template info */}
              <div className="flex-grow min-w-0">
                <h3 className="text-xs font-medium truncate">{template.name}</h3>
                <p className="text-[10px] text-gray-500 truncate">{template.description}</p>
                {template.aspectRatio && (
                  <p className="text-[9px] text-blue-500 truncate mt-1">Aspect ratio: {template.aspectRatio}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!compact && currentImageCount > 0 && (
        <div className="text-center text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-md">
          {currentImageCount === Number.parseInt(selectedImageCount) ? (
            <p>Perfect match! You have exactly the right number of images.</p>
          ) : currentImageCount < Number.parseInt(selectedImageCount) ? (
            <p>
              You have {currentImageCount} image{currentImageCount !== 1 ? "s" : ""}. This template needs{" "}
              {Number.parseInt(selectedImageCount) - currentImageCount} more.
            </p>
          ) : (
            <p>
              You have {currentImageCount - Number.parseInt(selectedImageCount)} extra image
              {currentImageCount - Number.parseInt(selectedImageCount) !== 1 ? "s" : ""}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
