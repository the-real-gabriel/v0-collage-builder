# Grid Editor

A flexible and powerful grid-based collage builder for creating beautiful image layouts.

## Features

- Drag and drop interface for arranging images
- Customizable grid dimensions and spacing
- Responsive design with zoom controls
- Image upload from device, URL, or stock images
- Photo tray for managing unused images
- Template-based layouts for quick designs
- Corner radius control for rounded images
- Export options (coming soon)

## Project Structure

\`\`\`
grid-editor/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── features/           # Feature-specific components
│   │   ├── grid/           # Grid-related components
│   │   └── ...             # Other feature components
│   ├── layout/             # Layout components
│   └── ui/                 # UI components (shadcn/ui)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── public/                 # Static assets
└── utils/                  # Utility functions
\`\`\`

## Component Organization

- **Top-level components**: Main feature components like `grid-editor.tsx`
- **Feature components**: Components specific to a feature area in `components/features/`
- **Layout components**: Page layout components in `components/layout/`
- **UI components**: Reusable UI components in `components/ui/`

## Development

This project uses Next.js with the App Router and is built with React, TypeScript, and Tailwind CSS.

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Best Practices

- Keep components focused on a single responsibility
- Use custom hooks for shared logic
- Centralize constants and utility functions
- Follow consistent naming conventions (kebab-case for files, PascalCase for components)
