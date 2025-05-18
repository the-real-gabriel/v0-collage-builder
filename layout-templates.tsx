"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define template interface
export interface LayoutTemplate {
  id: string
  name: string
  description: string
  imageCount: number
  layout: {
    position: number
    rowSpan: number
    colSpan: number
  }[]
  rows: number
  columns: number
}

// Define templates for different numbers of images
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // 2 Image Templates - with clear distinctions
  {
    id: "2-horizontal-equal",
    name: "Horizontal Equal",
    description: "Two equal-sized images side by side",
    imageCount: 2,
    rows: 1,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: "2-vertical-equal",
    name: "Vertical Equal",
    description: "Two equal-sized images stacked vertically",
    imageCount: 2,
    rows: 2,
    columns: 1,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: "2-left-feature",
    name: "Left Feature",
    description: "Large image on left, small on right",
    imageCount: 2,
    rows: 2,
    columns: 3,
    layout: [
      { position: 0, rowSpan: 2, colSpan: 2 },
      { position: 2, rowSpan: 2, colSpan: 1 },
    ],
  },
  {
    id: "2-top-feature",
    name: "Top Feature",
    description: "Large image on top, small below",
    imageCount: 2,
    rows: 3,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 2, colSpan: 2 },
      { position: 4, rowSpan: 1, colSpan: 2 },
    ],
  },

  // 3 Image Templates
  {
    id: "3-equal-row",
    name: "Equal Row",
    description: "Three equal images in a row",
    imageCount: 3,
    rows: 1,
    columns: 3,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 1, colSpan: 1 },
      { position: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: "3-left-stack",
    name: "Left Stack",
    description: "Two stacked images on left, one large on right",
    imageCount: 3,
    rows: 2,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 2, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 2, colSpan: 1 },
    ],
  },
  {
    id: "3-top-feature",
    name: "Top Feature",
    description: "Large image on top, two small below",
    imageCount: 3,
    rows: 2,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 2 },
      { position: 2, rowSpan: 1, colSpan: 1 },
      { position: 3, rowSpan: 1, colSpan: 1 },
    ],
  },

  // 4 Image Templates
  {
    id: "4-grid",
    name: "Grid",
    description: "Four equal images in a grid",
    imageCount: 4,
    rows: 2,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 1, colSpan: 1 },
      { position: 2, rowSpan: 1, colSpan: 1 },
      { position: 3, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: "4-feature-right",
    name: "Feature Right",
    description: "Three images on left, one large on right",
    imageCount: 4,
    rows: 3,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 2, rowSpan: 1, colSpan: 1 },
      { position: 4, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 3, colSpan: 1 },
    ],
  },
  {
    id: "4-feature-top",
    name: "Feature Top",
    description: "Large image on top with three below",
    imageCount: 4,
    rows: 2,
    columns: 3,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 3 },
      { position: 3, rowSpan: 1, colSpan: 1 },
      { position: 4, rowSpan: 1, colSpan: 1 },
      { position: 5, rowSpan: 1, colSpan: 1 },
    ],
  },

  // 5 Image Templates
  {
    id: "5-quilt",
    name: "Quilt",
    description: "Quilt-like arrangement with varied sizes",
    imageCount: 5,
    rows: 3,
    columns: 3,
    layout: [
      { position: 0, rowSpan: 2, colSpan: 2 },
      { position: 2, rowSpan: 1, colSpan: 1 },
      { position: 5, rowSpan: 1, colSpan: 1 },
      { position: 6, rowSpan: 1, colSpan: 1 },
      { position: 7, rowSpan: 1, colSpan: 2 },
    ],
  },
  {
    id: "5-feature-left",
    name: "Feature Left",
    description: "Large image on left, four smaller on right",
    imageCount: 5,
    rows: 4,
    columns: 2,
    layout: [
      { position: 0, rowSpan: 4, colSpan: 1 },
      { position: 1, rowSpan: 1, colSpan: 1 },
      { position: 3, rowSpan: 1, colSpan: 1 },
      { position: 5, rowSpan: 1, colSpan: 1 },
      { position: 7, rowSpan: 1, colSpan: 1 },
    ],
  },

  // 6 Image Templates
  {
    id: "6-grid",
    name: "Grid",
    description: "Six images in a 3x2 grid",
    imageCount: 6,
    rows: 2,
    columns: 3,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 1 },
      { position: 1, rowSpan: 1, colSpan: 1 },
      { position: 2, rowSpan: 1, colSpan: 1 },
      { position: 3, rowSpan: 1, colSpan: 1 },
      { position: 4, rowSpan: 1, colSpan: 1 },
      { position: 5, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: "6-panorama",
    name: "Panorama",
    description: "Wide panorama on top with five images below",
    imageCount: 6,
    rows: 2,
    columns: 5,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 5 },
      { position: 5, rowSpan: 1, colSpan: 1 },
      { position: 6, rowSpan: 1, colSpan: 1 },
      { position: 7, rowSpan: 1, colSpan: 1 },
      { position: 8, rowSpan: 1, colSpan: 1 },
      { position: 9, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: "6-feature-center",
    name: "Feature Center",
    description: "Large center image with five around it",
    imageCount: 6,
    rows: 3,
    columns: 3,
    layout: [
      { position: 0, rowSpan: 1, colSpan: 3 },
      { position: 3, rowSpan: 1, colSpan: 1 },
      { position: 4, rowSpan: 1, colSpan: 1 },
      { position: 5, rowSpan: 1, colSpan: 1 },
      { position: 6, rowSpan: 1, colSpan: 1 },
      { position: 7, rowSpan: 1, colSpan: 2 },
    ],
  },
]

interface LayoutTemplatesProps {
  onSelectTemplate: (template: LayoutTemplate) => void
  currentImageCount: number
  compact?: boolean
}

export function LayoutTemplates({ onSelectTemplate, currentImageCount, compact = false }: LayoutTemplatesProps) {
  const [selectedImageCount, setSelectedImageCount] = useState<string>(
    currentImageCount >= 2 && currentImageCount <= 6 ? currentImageCount.toString() : "2",
  )

  // Filter templates by image count
  const filteredTemplates = LAYOUT_TEMPLATES.filter(
    (template) => template.imageCount === Number.parseInt(selectedImageCount),
  )

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
                    gridTemplateColumns: `repeat(${template.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${template.rows}, 1fr)`,
                  }}
                >
                  {template.layout.map((item, idx) => {
                    const row = Math.floor(item.position / template.columns) + 1
                    const col = (item.position % template.columns) + 1

                    return (
                      <div
                        key={idx}
                        className="bg-blue-200 rounded-sm"
                        style={{
                          gridRow: `${row} / span ${item.rowSpan}`,
                          gridColumn: `${col} / span ${item.colSpan}`,
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Template info */}
              <div className="flex-grow min-w-0">
                <h3 className="text-xs font-medium truncate">{template.name}</h3>
                <p className="text-[10px] text-gray-500 truncate">{template.description}</p>
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
