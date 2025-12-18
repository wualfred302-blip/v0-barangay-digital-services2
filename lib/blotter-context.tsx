"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

export function BlotterProvider({ children }: { children: ReactNode }) {
  const [blotters, setBlotters] = useState<Blotter[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem("barangay_blotters")
    const storedCounter = localStorage.getItem("barangay_blotter_counter")
    if (stored) {
      setBlotters(JSON.parse(stored))
    }
    if (storedCounter) {
      setCounter(Number.parseInt(storedCounter, 10))
    }
  }, [])

  const generateBlotterNumber = () => {
    const nextNum = counter + 1
    setCounter(nextNum)
    localStorage.setItem("barangay_blotter_counter", nextNum.toString())
    const year = new Date().getFullYear()
    return `BLT-${year}-${String(nextNum).padStart(6, "0")}`
  }

  const addBlotter = (blotterData: Omit<Blotter, "id" | "blotterNumber" | "createdAt" | "updatedAt">) => {
    const newBlotter: Blotter = {
      ...blotterData,
      id: crypto.randomUUID(),
      blotterNumber: generateBlotterNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newBlotter, ...blotters]
    setBlotters(updated)
    localStorage.setItem("barangay_blotters", JSON.stringify(updated))
    return newBlotter
  }

  const updateBlotter = (id: string, updates: Partial<Blotter>) => {
    const updated = blotters.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    setBlotters(updated)
    localStorage.setItem("barangay_blotters", JSON.stringify(updated))
  }

  const getBlotter = (id: string) => blotters.find((b) => b.id === id)

  const getBlottersByStatus = (status: BlotterStatus | "all") => {
    if (status === "all") return blotters
    return blotters.filter((b) => b.status === status)
  }

  return (
    <BlotterContext.Provider value={{ blotters, addBlotter, updateBlotter, getBlotter, getBlottersByStatus }}>
      {children}
    </BlotterContext.Provider>
  )
}

export function useBlotters() {
  const context = useContext(BlotterContext)
  if (context === undefined) {
    throw new Error("useBlotters must be used within a BlotterProvider")
  }
  return context
}
