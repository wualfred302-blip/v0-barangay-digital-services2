"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, memo, useCallback, useMemo } from "react"

export type BlotterStatus =
  | "filed"
  | "under_investigation"
  | "scheduled_mediation"
  | "resolved"
  | "escalated"
  | "dismissed"

export interface Blotter {
  id: string
  blotterNumber: string
  complainantName: string
  complainantContact?: string
  complainantAddress?: string
  respondentName?: string
  respondentAddress?: string
  incidentType: string
  incidentDate: string
  incidentTime?: string
  incidentLocation: string
  narrative: string
  isAnonymous: boolean
  status: BlotterStatus
  assignedTo?: string
  resolutionNotes?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

interface BlotterContextType {
  blotters: Blotter[]
  addBlotter: (blotter: Omit<Blotter, "id" | "blotterNumber" | "createdAt" | "updatedAt">) => Blotter
  updateBlotter: (id: string, updates: Partial<Blotter>) => void
  getBlotter: (id: string) => Blotter | undefined
  getBlottersByStatus: (status: BlotterStatus | "all") => Blotter[]
}

const BlotterContext = createContext<BlotterContextType | undefined>(undefined)

export const BlotterProvider = memo(({ children }: { children: ReactNode }) => {
  const [blotters, setBlotters] = useState<Blotter[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const load = async () => {
      const stored = localStorage.getItem("barangay_blotters")
      const storedCounter = localStorage.getItem("barangay_blotter_counter")
      if (stored) {
        try {
          setBlotters(JSON.parse(stored))
        } catch (error) {
          console.error("Failed to parse blotters:", error)
          localStorage.removeItem("barangay_blotters")
          setBlotters([])
        }
      }
      if (storedCounter) {
        setCounter(Number.parseInt(storedCounter, 10) || 0)
      }
    }
    load()
  }, [])

  // Debounced save
  useEffect(() => {
    if (blotters.length === 0 && counter === 0) return
    const timeout = setTimeout(() => {
      localStorage.setItem("barangay_blotters", JSON.stringify(blotters, null, 0))
      localStorage.setItem("barangay_blotter_counter", counter.toString())
    }, 1000)
    return () => clearTimeout(timeout)
  }, [blotters, counter])

  const generateBlotterNumber = useCallback(() => {
    const nextNum = counter + 1
    setCounter(nextNum)
    const year = new Date().getFullYear()
    return `BLT-${year}-${String(nextNum).padStart(6, "0")}`
  }, [counter])

  const addBlotter = useCallback((blotterData: Omit<Blotter, "id" | "blotterNumber" | "createdAt" | "updatedAt">) => {
    const nextNum = counter + 1
    setCounter(nextNum)
    const year = new Date().getFullYear()
    const blotterNumber = `BLT-${year}-${String(nextNum).padStart(6, "0")}`

    const newBlotter: Blotter = {
      ...blotterData,
      id: crypto.randomUUID(),
      blotterNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBlotters(prev => [newBlotter, ...prev])
    return newBlotter
  }, [counter])

  const updateBlotter = useCallback((id: string, updates: Partial<Blotter>) => {
    setBlotters(prev => prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)))
  }, [])

  const getBlotter = useCallback((id: string) => blotters.find((b) => b.id === id), [blotters])

  const getBlottersByStatus = useCallback((status: BlotterStatus | "all") => {
    if (status === "all") return blotters
    return blotters.filter((b) => b.status === status)
  }, [blotters])

  const value = useMemo(() => ({
    blotters,
    addBlotter,
    updateBlotter,
    getBlotter,
    getBlottersByStatus
  }), [blotters, addBlotter, updateBlotter, getBlotter, getBlottersByStatus])

  return (
    <BlotterContext.Provider value={value}>
      {children}
    </BlotterContext.Provider>
  )
})

export function useBlotters() {
  const context = useContext(BlotterContext)
  if (context === undefined) {
    throw new Error("useBlotters must be used within a BlotterProvider")
  }
  return context
}
