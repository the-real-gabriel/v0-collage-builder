"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface RoundedImageProps {
  src: string
  alt: string
  cornerRadius?: number
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  onError?: () => void
}

export function RoundedImage({
  src,
  alt,
  cornerRadius,
  className,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  onError,
  ...props
}: RoundedImageProps) {
  const [imgError, setImgError] = useState(false)

  // Create a consistent border radius style object
  const borderRadiusStyle =
    cornerRadius !== undefined ? { borderRadius: `${cornerRadius}px` } : { borderRadius: "var(--corner-radius, 0px)" }

  // Use a placeholder if the image fails to load
  const imageSrc = imgError ? "/placeholder.svg" : src || "/placeholder.svg"

  const handleError = () => {
    setImgError(true)
    if (onError) onError()
  }

  return (
    <div className={cn("overflow-hidden relative w-full h-full", className)} style={borderRadiusStyle}>
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className="object-cover w-full h-full"
        style={borderRadiusStyle}
        priority={priority}
        sizes={sizes}
        onError={handleError}
        {...props}
      />
    </div>
  )
}
