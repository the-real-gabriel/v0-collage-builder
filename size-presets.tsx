"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Define the preset interface
export interface SizePreset {
  id: string
  name: string
  width: number
  height: number
  ratio: string
  category: "standard" | "widescreen" | "photo" | "custom"
  description?: string
}

// Define common aspect ratio presets
export const SIZE_PRESETS: SizePreset[] = [
  // Square and Classic Ratios
  {
    id: "square-1-1",
    name: "Square",
    ratio: "1:1",
    width: 1000,
    height: 1000,
    category: "standard",
    description: "Perfect square format",
  },
  {
    id: "classic-4-3",
    name: "Classic",
    ratio: "4:3",
    width: 1200,
    height: 900, // Exactly 4:3 ratio (1200 ÷ 4 × 3 = 900)
    category: "standard",
    description: "Traditional TV and computer monitor ratio",
  },
  {
    id: "classic-3-2",
    name: "Photo",
    ratio: "3:2",
    width: 1200,
    height: 800, // Exactly 3:2 ratio (1200 ÷ 3 × 2 = 800)
    category: "photo",
    description: "Standard DSLR camera ratio",
  },

  // Widescreen Ratios
  {
    id: "widescreen-16-9",
    name: "HD Widescreen",
    ratio: "16:9",
    width: 1600,
    height: 900, // Exactly 16:9 ratio (1600 ÷ 16 × 9 = 900)
    category: "widescreen",
    description: "Standard HD video format",
  },
  {
    id: "widescreen-21-9",
    name: "Ultrawide",
    ratio: "21:9",
    width: 2100,
    height: 900, // Exactly 21:9 ratio (2100 ÷ 21 × 9 = 900)
    category: "widescreen",
    description: "Cinematic widescreen format",
  },
  {
    id: "widescreen-2-1",
    name: "Panoramic",
    ratio: "2:1",
    width: 2000,
    height: 1000, // Exactly 2:1 ratio (2000 ÷ 2 × 1 = 1000)
    category: "widescreen",
    description: "Wide panoramic format",
  },

  // Photo Ratios
  {
    id: "photo-5-4",
    name: "Large Format",
    ratio: "5:4",
    width: 1250,
    height: 1000, // Exactly 5:4 ratio (1250 ÷ 5 × 4 = 1000)
    category: "photo",
    description: "Traditional large format photography",
  },
  {
    id: "photo-7-5",
    name: "Digital Photo",
    ratio: "7:5",
    width: 1400,
    height: 1000, // Exactly 7:5 ratio (1400 ÷ 7 × 5 = 1000)
    category: "photo",
    description: "Common digital photo print ratio",
  },
  {
    id: "photo-16-10",
    name: "Computer",
    ratio: "16:10",
    width: 1600,
    height: 1000, // Exactly 16:10 ratio (1600 ÷ 16 × 10 = 1000)
    category: "photo",
    description: "Common laptop screen ratio",
  },

  // Portrait Ratios
  {
    id: "portrait-3-4",
    name: "Portrait",
    ratio: "3:4",
    width: 900,
    height: 1200, // Exactly 3:4 ratio (900 ÷ 3 × 4 = 1200)
    category: "standard",
    description: "Vertical version of the classic 4:3 ratio",
  },
  {
    id: "portrait-2-3",
    name: "Portrait Photo",
    ratio: "2:3",
    width: 800,
    height: 1200, // Exactly 2:3 ratio (800 ÷ 2 × 3 = 1200)
    category: "photo",
    description: "Vertical version of the 3:2 photo ratio",
  },
  {
    id: "portrait-9-16",
    name: "Mobile",
    ratio: "9:16",
    width: 900,
    height: 1600, // Exactly 9:16 ratio (900 ÷ 9 × 16 = 1600)
    category: "widescreen",
    description: "Vertical version of the 16:9 ratio, common for mobile",
  },
]

interface SizePresetsProps {
  onSelectPreset: (preset: SizePreset) => void
  currentWidth: number
  currentHeight: number
}

export function SizePresets({ onSelectPreset, currentWidth, currentHeight }: SizePresetsProps) {
  // Calculate current aspect ratio
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  const divisor = gcd(currentWidth, currentHeight)
  const currentRatioWidth = currentWidth / divisor
  const currentRatioHeight = currentHeight / divisor

  // Group presets by orientation
  const landscapePresets = SIZE_PRESETS.filter((preset) => preset.width >= preset.height)
  const portraitPresets = SIZE_PRESETS.filter((preset) => preset.width < preset.height)

  // Check if current dimensions match any preset ratio
  const currentRatioString = `${currentRatioWidth}:${currentRatioHeight}`
  const currentPresetId = SIZE_PRESETS.find(
    (preset) =>
      preset.ratio === currentRatioString ||
      (currentRatioWidth / currentRatioHeight).toFixed(2) ===
        (Number(preset.ratio.split(":")[0]) / Number(preset.ratio.split(":")[1])).toFixed(2),
  )?.id

  return (
    <div className="size-presets space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Landscape Ratios</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {landscapePresets.map((preset) => (
            <PresetButton
              key={preset.id}
              preset={preset}
              isActive={preset.id === currentPresetId}
              onClick={() => onSelectPreset(preset)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Portrait Ratios</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {portraitPresets.map((preset) => (
            <PresetButton
              key={preset.id}
              preset={preset}
              isActive={preset.id === currentPresetId}
              onClick={() => onSelectPreset(preset)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface PresetButtonProps {
  preset: SizePreset
  isActive: boolean
  onClick: () => void
}

function PresetButton({ preset, isActive, onClick }: PresetButtonProps) {
  // Calculate aspect ratio for visual representation
  const aspectRatio = preset.width / preset.height

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className="flex flex-col items-start justify-center h-auto py-2 px-3 text-left"
      onClick={onClick}
    >
      <div className="w-full flex items-center justify-between mb-1">
        <span className="font-medium text-xs">{preset.name}</span>
        <div
          className={cn("border rounded-sm", isActive ? "border-white bg-white/20" : "border-gray-300 bg-gray-100")}
          style={{
            width: aspectRatio > 1 ? "24px" : 24 * aspectRatio + "px",
            height: aspectRatio < 1 ? "24px" : 24 / aspectRatio + "px",
          }}
        />
      </div>
      <span className={cn("text-xs w-full truncate", isActive ? "text-gray-200" : "text-gray-500")}>
        {preset.ratio}
      </span>
    </Button>
  )
}
