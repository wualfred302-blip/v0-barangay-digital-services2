"use client"

import { useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { Camera, AlertCircle, Type, Loader2, VideoOff, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Dynamic import to avoid SSR issues with camera APIs
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }
)

interface LiveQRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
  disabled?: boolean
}

type CameraError = "permission-denied" | "not-found" | "in-use" | "unknown" | null

export function LiveQRScanner({ onScan, onError, disabled }: LiveQRScannerProps) {
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<CameraError>(null)
  const [isScanning, setIsScanning] = useState(true)
  const lastScannedRef = useRef<string | null>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce scans to prevent duplicate callbacks
  const handleScanResult = useCallback((result: any) => {
    if (disabled || !result?.[0]?.rawValue) return

    const scannedData = result[0].rawValue

    // Prevent duplicate scans within 2 seconds
    if (lastScannedRef.current === scannedData) return
    lastScannedRef.current = scannedData

    // Clear previous timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
    }

    // Reset debounce after 2 seconds
    scanTimeoutRef.current = setTimeout(() => {
      lastScannedRef.current = null
    }, 2000)

    onScan(scannedData)
  }, [onScan, disabled])

  const handleCameraError = useCallback((err: any) => {
    console.error("Camera error:", err)

    const errorName = err?.name || err?.message || String(err)

    if (errorName.includes("NotAllowed") || errorName.includes("Permission")) {
      setCameraError("permission-denied")
      setError("Camera access denied. Please enable camera permissions in your browser settings.")
    } else if (errorName.includes("NotFound") || errorName.includes("DevicesNotFound")) {
      setCameraError("not-found")
      setError("No camera found on this device.")
    } else if (errorName.includes("NotReadable") || errorName.includes("TrackStart")) {
      setCameraError("in-use")
      setError("Camera is being used by another application.")
    } else {
      setCameraError("unknown")
      setError("Failed to access camera. Please try again.")
    }

    if (onError) onError(error || "Camera error")
  }, [onError, error])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return

    // Validation for both QRT and VRF formats
    const qrtRegex = /^QRT-\d{4}-\d{6}$/
    const vrfRegex = /^VRF-\d{4}-\d{6}$/

    if (!qrtRegex.test(manualCode) && !vrfRegex.test(manualCode)) {
      const errorMsg = "Invalid format. Expected: VRF-YYYY-NNNNNN or QRT-YYYY-NNNNNN"
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return
    }

    onScan(manualCode)
    setManualCode("")
    setError(null)
  }

  const retryCamera = () => {
    setCameraError(null)
    setError(null)
    setIsScanning(false)
    // Brief delay then restart
    setTimeout(() => setIsScanning(true), 100)
  }

  // Render camera error state
  if (cameraError && !showManualEntry) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <VideoOff className="h-8 w-8 text-red-500" />
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Camera Unavailable</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>

          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={retryCamera}
              className="flex-1"
              disabled={disabled}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button
              onClick={() => {
                setShowManualEntry(true)
                setCameraError(null)
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={disabled}
            >
              <Type className="mr-2 h-4 w-4" />
              Enter Manually
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Render manual entry mode
  if (showManualEntry) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/50 p-4">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-code" className="text-sm font-medium text-gray-700">
              Enter Code
            </Label>
            <Input
              id="manual-code"
              placeholder="VRF-YYYY-NNNNNN or QRT-YYYY-NNNNNN"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value.toUpperCase())
                setError(null)
              }}
              className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              disabled={disabled}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowManualEntry(false)
                setError(null)
                setIsScanning(true)
              }}
              className="flex-1"
              disabled={disabled}
            >
              Back to Camera
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={disabled || !manualCode}
            >
              Verify Code
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  // Render live scanner
  return (
    <Card className="border-emerald-100 bg-emerald-50/50 overflow-hidden">
      <div className="relative">
        {/* Scanner viewport */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-900">
          {isScanning && !disabled && (
            <Scanner
              onScan={handleScanResult}
              onError={handleCameraError}
              constraints={{
                facingMode: "environment"
              }}
              styles={{
                container: {
                  width: "100%",
                  height: "100%",
                },
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }
              }}
              components={{
                audio: false,
                torch: false,
              }}
            />
          )}

          {/* Scanning frame overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48">
              {/* Corner brackets */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-emerald-400" />
              <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-emerald-400" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-emerald-400" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-emerald-400" />

              {/* Scanning line animation */}
              <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                   style={{ animation: "scan 2s ease-in-out infinite" }} />
            </div>
          </div>

          {/* Hint text */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
              Point camera at QR code
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">Live Scanning</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowManualEntry(true)
                setIsScanning(false)
              }}
              className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
              disabled={disabled}
            >
              <Type className="mr-2 h-4 w-4" />
              Enter Manually
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(192px); opacity: 1; }
        }
      `}</style>
    </Card>
  )
}
