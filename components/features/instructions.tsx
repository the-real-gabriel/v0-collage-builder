"use client"

export function Instructions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        This grid editor allows you to create and customize image layouts using CSS Grid. Follow these instructions to
        get started:
      </p>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-800">Getting Started</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Add your first image</strong> - Click on any empty cell to add an image
          </li>
          <li>
            <strong>Choose image sources</strong> - Upload your own images, use a URL, or select from our stock
            collection
          </li>
          <li>
            <strong>Add multiple images at once</strong> - Use the "Upload Multiple Images" button at the top
          </li>
        </ul>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-800">Grid Controls</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Add/remove rows and columns</strong> - Use the + and - buttons in the row and column headers
          </li>
          <li>
            <strong>Adjust grid dimensions</strong> - Use the sidebar controls to change width, height, and spacing
          </li>
          <li>
            <strong>Reset the grid</strong> - Click the "Reset Grid" button in the sidebar footer
          </li>
        </ul>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-800">Layout Templates</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Choose from templates</strong> - Click the "Templates" button to select from pre-designed layouts
          </li>
          <li>
            <strong>Templates for 2-6 images</strong> - Different arrangements optimized for various numbers of images
          </li>
          <li>
            <strong>Apply anytime</strong> - Apply templates before or after adding images - empty placeholders will be
            created
          </li>
          <li>
            <strong>Fill placeholders</strong> - Click on any empty placeholder to add an image to that position
          </li>
        </ul>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-800">Working with Images</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Select an image</strong> - Click on any image to select it (blue outline appears)
          </li>
          <li>
            <strong>Move images</strong> - Drag and drop selected images to rearrange them
          </li>
          <li>
            <strong>Resize images</strong> - Drag the blue handles on the edges and corners of selected images
          </li>
          <li>
            <strong>Change images</strong> - Click the image icon in the overlay controls
          </li>
          <li>
            <strong>Delete images</strong> - Click the trash icon or press Delete key when an image is selected
          </li>
        </ul>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-800">Tips & Shortcuts</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Swap images</strong> - Drag an image directly onto another image to swap their positions
          </li>
          <li>
            <strong>Keyboard shortcuts</strong> - Press Delete to remove selected images, Escape to deselect
          </li>
          <li>
            <strong>Sidebar space</strong> - The sidebar collapses to icon mode when you need more editing space
          </li>
        </ul>
      </div>
    </div>
  )
}
