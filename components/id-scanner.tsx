"use client"

import type React from "react"
import { useState } from "react"
import { Camera, Upload, Loader2, CheckCircle2 } from "lucide-react"

interface IDData {
  fullName: string
  birthDate: string
  address: string
  mobileNumber: string
  age: string
}

interface IDScannerProps {
  onDataExtracted: (data: IDData) => void
  disabled?: boolean
}

export function IDScanner({ onDataExtracted, disabled }: IDScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")!

          // Resize to max 1200px width
          const maxWidth = 1200
          const scale = Math.min(maxWidth / img.width, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Convert to base64 JPEG (0.8 quality)
          const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1]
          resolve(base64)
        }
      }
    })
  }

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setStatusMessage("Compressing image...")

    try {
      // Compress image
      setProgress(20)
      const base64 = await compressImage(file)

      setStatusMessage("Reading ID card...")
      setProgress(40)

      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 85))
      }, 200)

      // Call OCR API
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      })

      clearInterval(progressInterval)

      let result
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        const text = await response.text()
        throw new Error(text || "Server returned an invalid response")
      }

      if (result.success) {
        setProgress(90)
        setStatusMessage("Filling form...")

        // Fill form
        onDataExtracted(result.data)

        setProgress(100)
        setShowSuccess(true)

        // Hide overlay after showing success
        setTimeout(() => {
          setIsProcessing(false)
          setShowSuccess(false)
          setProgress(0)
        }, 1500)
      } else {
        throw new Error(result.error || "Failed to process ID")
      }
    } catch (error: any) {
      console.error("Scan failed:", error)
      setIsProcessing(false)
      setProgress(0)

      alert(error.message || "Failed to scan ID. Please try again or fill manually.")
    }

    // Reset file input
    e.target.value = ""
  }

  return (
    <div className="space-y-4">
      {/* Scan Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Quick Registration</h3>
            <p className="text-sm text-gray-600">Scan your ID to auto-fill this form</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Camera Capture */}
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
              disabled={disabled || isProcessing}
            />
            <div
              className={`flex items-center justify-center gap-2 h-12 bg-emerald-500 text-white rounded-xl font-semibold text-sm transition ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-600 active:scale-[0.98]"}`}
            >
              <Camera className="w-4 h-4" />
              Scan ID
            </div>
          </label>

          {/* File Upload */}
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleCapture}
              className="hidden"
              disabled={disabled || isProcessing}
            />
            <div
              className={`flex items-center justify-center gap-2 h-12 border-2 border-gray-200 bg-white rounded-xl font-semibold text-sm transition ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 active:scale-[0.98]"}`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </div>
          </label>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Supports Philippine National ID, Driver's License, UMID, and more
        </p>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              {showSuccess ? (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
              ) : (
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              )}
            </div>

            {/* Status */}
            <h3 className="text-xl font-bold text-center mb-2">{showSuccess ? "Success!" : "Processing..."}</h3>
            <p className="text-gray-600 text-center mb-6">{showSuccess ? "ID scanned successfully" : statusMessage}</p>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ease-out ${showSuccess ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center font-medium">{progress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gradient-to-b from-blue-50 to-white text-gray-500 font-medium">
            or fill manually
          </span>
        </div>
      </div>
    </div>
  )
}
