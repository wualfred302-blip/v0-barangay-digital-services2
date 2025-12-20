"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface SignaturePadProps {
  onSave: (signature: string) => void
  onClear: () => void
}

export function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size (scaled for retina displays)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    
    // Scale context to match
    ctx.scale(2, 2)
    
    // Set line styles
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    setLastX(e.nativeEvent.offsetX)
    setLastY(e.nativeEvent.offsetY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
    
    setLastX(e.nativeEvent.offsetX)
    setLastY(e.nativeEvent.offsetY)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    saveSignature()
  }

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling
    setIsDrawing(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    setLastX(touch.clientX - rect.left)
    setLastY(touch.clientY - rect.top)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling
    if (!isDrawing || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const currentX = touch.clientX - rect.left
    const currentY = touch.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()
    
    setLastX(currentX)
    setLastY(currentY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(false)
    saveSignature()
  }

  const saveSignature = () => {
    if (!canvasRef.current) return
    const signature = canvasRef.current.toDataURL("image/png")
    onSave(signature)
  }

  const handleClear = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    onClear()
  }

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white shadow-sm">
        <canvas
          ref={canvasRef}
          className="h-[200px] w-full cursor-crosshair touch-none bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClear}
          className="text-slate-500 hover:text-slate-900"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Reset Signature
        </Button>
      </div>
    </div>
  )
}
