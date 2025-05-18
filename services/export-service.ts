// Helper function to export collage as an image
export async function exportCollageAsImage(
  gridRef: HTMLElement,
  options = {
    format: "png",
    quality: 1.0,
    backgroundColor: "#ffffff",
  },
): Promise<string> {
  // We'll use html2canvas library
  const html2canvas = (await import("html2canvas")).default

  try {
    // Create a canvas from the grid element
    const canvas = await html2canvas(gridRef, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: options.backgroundColor,
      scale: 2, // Higher resolution
    })

    // Convert canvas to data URL
    return canvas.toDataURL(`image/${options.format}`, options.quality)
  } catch (error) {
    console.error("Error exporting collage:", error)
    throw new Error("Failed to export collage as image")
  }
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
