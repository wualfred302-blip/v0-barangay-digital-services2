"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Copy, Check } from "lucide-react"

interface PaymentFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
}

export function GCashForm({ onSubmit, isLoading }: PaymentFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Auto-submit with demo data
    onSubmit({ mobile: "09171234567", pin: "1234" })
  }

  return (
    <Card className="border-0 bg-[#007DFE] text-white shadow-md">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-center">
          <div className="h-12 w-32 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xl tracking-wider">GCash</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-white/80 text-sm text-center mb-4">
            Click the button below to proceed with GCash payment
          </p>
          <Button
            type="submit"
            className="w-full bg-white text-[#007DFE] hover:bg-white/90 h-12 mt-2 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay with GCash"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function MayaForm({ onSubmit, isLoading }: PaymentFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Auto-submit with demo data
    onSubmit({ mobile: "09171234567", pin: "123456" })
  }

  return (
    <Card className="border-0 bg-[#00D632] text-white shadow-md">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-center">
           <div className="h-12 w-32 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xl tracking-wider">Maya</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-white/80 text-sm text-center mb-4">
            Click the button below to proceed with Maya payment
          </p>
          <Button
            type="submit"
            className="w-full bg-white text-[#00D632] hover:bg-white/90 h-12 mt-2 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay with Maya"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function BankTransferForm({ onSubmit, isLoading }: PaymentFormProps) {
  const [formData, setFormData] = useState({ referenceNumber: "" })
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText("1234-5678-9012")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-50 border border-gray-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-medium text-gray-500">Bank Details</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-900">BDO Unibank</div>
              <div className="text-sm text-gray-600">Barangay Mawaque</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <code className="flex-1 font-mono text-lg font-semibold text-gray-800">1234-5678-9012</code>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500">Transfer the exact amount to the account above.</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proof">Upload Receipt</Label>
          <div className="relative">
            <Input
              id="proof"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            <Label
              htmlFor="proof"
              className="flex items-center gap-2 w-full p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600 transition-colors bg-white"
            >
              <Upload className="h-4 w-4 text-gray-400" />
              {fileName || "Select receipt image or PDF..."}
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ref-number">Reference Number</Label>
          <Input
            id="ref-number"
            placeholder="Enter transaction reference"
            value={formData.referenceNumber}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            required
            className="bg-white"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white h-12 mt-2 font-semibold shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Submit Payment"}
        </Button>
      </form>
    </div>
  )
}
