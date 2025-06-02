"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogTrigger,
} from "@/components/custom-dialog"
import { Menu, X, Download, Upload, HelpCircle } from "lucide-react"
import { Instructions } from "@/instructions"
import { ExportDialog } from "@/export-dialog"

interface NavigationProps {
  gridRef: React.RefObject<HTMLDivElement>
  gridData: {
    rows: number
    columns: number
    gridWidth: number
    gridHeight: number
    gridGap: number
    boxes: any[]
  }
  onAddImages: (files: FileList) => void
  emptyCount: number
}

export function Navigation({ gridRef, gridData, onAddImages, emptyCount }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Navigation file input change event triggered")
    if (e.target.files && e.target.files.length > 0) {
      console.log(`Navigation selected ${e.target.files.length} files`)
      onAddImages(e.target.files)
      // Reset the input value so the same file can be selected again
      e.target.value = ""
    } else {
      console.warn("Navigation file input: No files selected")
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50 w-full shadow-subtle">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <h1 className="text-xl font-medium typography-heading">Collage Builder</h1>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 text-black/60">Beta</span>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 btn-subtle h-8"
              onClick={(e) => {
                e.preventDefault()
                fileInputRef.current?.click()
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Add Images</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            <CustomDialog>
              <CustomDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 btn-ghost h-8">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Help</span>
                </Button>
              </CustomDialogTrigger>
              <CustomDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto dialog-content-animation dialog-clean">
                <CustomDialogHeader>
                  <CustomDialogTitle className="typography-heading">How to Use the Grid Editor</CustomDialogTitle>
                </CustomDialogHeader>
                <Instructions />
              </CustomDialogContent>
            </CustomDialog>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 btn-subtle h-8"
              onClick={() => setIsExportOpen(true)}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn-ghost">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start btn-ghost"
              onClick={() => {
                setIsMenuOpen(false)
                fileInputRef.current?.click()
              }}
            >
              <Upload className="h-3.5 w-3.5 mr-2" />
              Add Images
            </Button>

            <CustomDialog>
              <CustomDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start btn-ghost"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-2" />
                  Help
                </Button>
              </CustomDialogTrigger>
              <CustomDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto dialog-content-animation dialog-clean">
                <CustomDialogHeader>
                  <CustomDialogTitle className="typography-heading">How to Use the Grid Editor</CustomDialogTitle>
                </CustomDialogHeader>
                <Instructions />
              </CustomDialogContent>
            </CustomDialog>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start btn-ghost"
              onClick={() => {
                setIsExportOpen(true)
                setIsMenuOpen(false)
              }}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        gridRef={gridRef}
        gridData={gridData}
      />
    </header>
  )
}
