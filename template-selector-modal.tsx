"use client"

import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogFooter,
} from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { LayoutTemplates, type LayoutTemplate } from "./layout-templates"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyTemplate: (template: LayoutTemplate) => void
  currentImageCount: number
}

export function TemplateSelectorModal({
  isOpen,
  onClose,
  onApplyTemplate,
  currentImageCount,
}: TemplateSelectorModalProps) {
  const handleSelectTemplate = (template: LayoutTemplate) => {
    onApplyTemplate(template)
    onClose()
  }

  return (
    <CustomDialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto dialog-clean">
        <CustomDialogHeader>
          <CustomDialogTitle className="typography-heading">Choose a Layout Template</CustomDialogTitle>
        </CustomDialogHeader>

        {currentImageCount === 0 && (
          <Alert className="mb-4 alert-clean bg-black/[0.02] border-black/[0.03]">
            <InfoIcon className="h-4 w-4 text-black/60" />
            <AlertTitle className="text-black/80 font-medium">No images yet</AlertTitle>
            <AlertDescription className="text-black/60">
              You can apply a template now and add images later. Empty placeholders will be created for you.
            </AlertDescription>
          </Alert>
        )}

        <LayoutTemplates onSelectTemplate={handleSelectTemplate} currentImageCount={currentImageCount} />

        <CustomDialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="btn-subtle">
            Cancel
          </Button>
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  )
}
