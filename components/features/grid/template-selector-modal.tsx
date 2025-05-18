"use client"

import { Button } from "@/components/ui/button"
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogFooter,
} from "@/components/custom-dialog"
import { LayoutTemplates, type LayoutTemplate } from "./layout-templates"

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyTemplate: (template: LayoutTemplate) => void
  onClearLayout: () => void
  currentImageCount: number
}

export function TemplateSelectorModal({
  isOpen,
  onClose,
  onApplyTemplate,
  onClearLayout,
  currentImageCount,
}: TemplateSelectorModalProps) {
  return (
    <CustomDialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto dialog-clean">
        <CustomDialogHeader>
          <CustomDialogTitle className="typography-heading">Layout Templates</CustomDialogTitle>
        </CustomDialogHeader>

        <div className="mt-4">
          <LayoutTemplates
            onSelectTemplate={onApplyTemplate}
            onClearLayout={onClearLayout}
            currentImageCount={currentImageCount}
          />
        </div>

        <CustomDialogFooter className="mt-6">
          <Button size="sm" onClick={onClose} className="btn-subtle h-8">
            Close
          </Button>
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  )
}
