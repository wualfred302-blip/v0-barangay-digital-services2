"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SignaturePad } from "./signature-pad"
import { PenTool, CheckCircle2, Eraser } from "lucide-react"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (signature: string) => void
  certificateType: string
  residentName: string
}

export function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  certificateType,
  residentName,
}: SignatureModalProps) {
  const [signature, setSignature] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleSave = (sig: string) => {
    setSignature(sig)
    setIsEmpty(false)
  }

  const handleClear = () => {
    setSignature(null)
    setIsEmpty(true)
  }

  const handleConfirm = () => {
    if (signature && !isEmpty) {
      onConfirm(signature)
      handleClear()
    }
  }

  const handleClose = () => {
    handleClear()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] overflow-hidden rounded-2xl p-0">
        <div className="bg-slate-50 p-6 pb-4">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <PenTool className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Digital Signature Required
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Please sign below to approve the <span className="font-semibold text-slate-900">{certificateType}</span> for <span className="font-semibold text-slate-900">{residentName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <SignaturePad onSave={handleSave} onClear={handleClear} />
          
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800 border border-yellow-200">
            <p className="font-medium">Legal Notice</p>
            <p>By signing this document digitally, you certify that the information is accurate and you are authorizing this certificate's release.</p>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-900"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isEmpty}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve & Sign
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
