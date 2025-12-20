"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, memo } from "react"

export type BayanihanUrgency = "low" | "medium" | "high"
export type BayanihanStatus = "pending" | "in_progress" | "resolved" | "rejected"
export type BayanihanType = 
  | "Infrastructure Issue"
  | "Road/Street Problem" 
  | "Lighting Issue"
  | "Flooding/Drainage"
  | "Community Cleanup Needed"
  | "Emergency Assistance"
  | "Other"

export interface BayanihanRequest {
  id: string
  number: string // BAY-YYYY-XXXXXX format
  residentName: string
  type: BayanihanType
  location: string
  description: string
  urgency: BayanihanUrgency
  photoBase64?: string
  status: BayanihanStatus
  contactPreference: boolean
  residentContact?: string
  assignedTo?: string
  resolutionNotes?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

interface BayanihanContextType {
  requests: BayanihanRequest[]
  addRequest: (request: Omit<BayanihanRequest, "id" | "number" | "createdAt" | "updatedAt">) => BayanihanRequest
  updateRequest: (id: string, updates: Partial<BayanihanRequest>) => void
  getRequest: (id: string) => BayanihanRequest | undefined
  getRequestsByStatus: (status: BayanihanStatus | "all") => BayanihanRequest[]
  getRequestsByUrgency: (urgency: BayanihanUrgency) => BayanihanRequest[]
  getPendingCount: () => number
  getHighUrgencyCount: () => number
}

const BayanihanContext = createContext<BayanihanContextType | undefined>(undefined)

// Dummy data for initial seeding
const seedRequests: BayanihanRequest[] = [
  {
    id: "bay-001",
    number: "BAY-2025-000001",
    residentName: "Juan Dela Cruz",
    type: "Road/Street Problem",
    location: "Main Road near Purok 3 entrance",
    description: "Large pothole causing accidents. Multiple tricycles have damaged tires. Needs immediate repair before rainy season.",
    urgency: "high",
    status: "pending",
    contactPreference: true,
    residentContact: "+63 917 123 4567",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-002",
    number: "BAY-2025-000002",
    residentName: "Maria Santos",
    type: "Lighting Issue",
    location: "Purok 5, Block 12 street corner",
    description: "Street light has been broken for 2 weeks. Area is very dark at night, residents feel unsafe.",
    urgency: "medium",
    status: "in_progress",
    contactPreference: true,
    residentContact: "+63 918 234 5678",
    assignedTo: "Maintenance Team",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-003",
    number: "BAY-2025-000003",
    residentName: "Jose Reyes",
    type: "Flooding/Drainage",
    location: "Low lying area in Purok 1",
    description: "Drainage canal is clogged with trash, causing water to rise quickly during light rains.",
    urgency: "high",
    status: "pending",
    contactPreference: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-004",
    number: "BAY-2025-000004",
    residentName: "Elena Garcia",
    type: "Community Cleanup Needed",
    location: "Vacant lot near the chapel",
    description: "The vacant lot has become a dumping ground for garbage. Needs cleanup and signage.",
    urgency: "low",
    status: "resolved",
    contactPreference: true,
    residentContact: "+63 919 345 6789",
    assignedTo: "Barangay Tanod",
    resolutionNotes: "Cleanup conducted on Saturday morning with volunteers.",
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-005",
    number: "BAY-2025-000005",
    residentName: "Ricardo Dalisay",
    type: "Infrastructure Issue",
    location: "Barangay Hall waiting shed",
    description: "Roof leak on the waiting shed.",
    urgency: "medium",
    status: "pending",
    contactPreference: true,
    residentContact: "+63 920 456 7890",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-006",
    number: "BAY-2025-000006",
    residentName: "Luzviminda Cruz",
    type: "Emergency Assistance",
    location: "Purok 2 Extension",
    description: "Large tree branch about to fall on electrical wires.",
    urgency: "high",
    status: "in_progress",
    contactPreference: true,
    residentContact: "+63 921 567 8901",
    assignedTo: "Kagawad Santos",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-007",
    number: "BAY-2025-000007",
    residentName: "Pedro Penduko",
    type: "Other",
    location: "Basketball Court",
    description: "Requesting schedule for liga meeting.",
    urgency: "low",
    status: "pending",
    contactPreference: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bay-008",
    number: "BAY-2025-000008",
    residentName: "Ana Marie",
    type: "Road/Street Problem",
    location: "Corner Lot, Purok 4",
    description: "Fallen signage blocking the sidewalk.",
    urgency: "medium",
    status: "resolved",
    contactPreference: true,
    residentContact: "+63 922 678 9012",
    assignedTo: "Maintenance Team",
    resolutionNotes: "Signage reinstalled.",
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
]

export const BayanihanProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [requests, setRequests] = useState<BayanihanRequest[]>([])
  const [counter, setCounter] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedRequests = localStorage.getItem("barangay_bayanihan_requests")
      const savedCounter = localStorage.getItem("barangay_bayanihan_counter")

      if (savedRequests) {
        setRequests(JSON.parse(savedRequests))
      } else {
        // Seed initial data
        setRequests(seedRequests)
        localStorage.setItem("barangay_bayanihan_requests", JSON.stringify(seedRequests))
      }

      if (savedCounter) {
        setCounter(parseInt(savedCounter, 10))
      } else {
        // Initialize counter based on seed data
        const maxSeedId = seedRequests.length
        setCounter(maxSeedId)
        localStorage.setItem("barangay_bayanihan_counter", maxSeedId.toString())
      }
    } catch (error) {
      console.error("Failed to load bayanihan requests:", error)
      // Fallback to seed data on error
      setRequests(seedRequests)
      setCounter(seedRequests.length)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever requests change (debounced)
  useEffect(() => {
    if (!isLoaded) return

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem("barangay_bayanihan_requests", JSON.stringify(requests))
      } catch (error) {
        console.error("Failed to save bayanihan requests:", error)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [requests, isLoaded])

  // Save counter to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem("barangay_bayanihan_counter", counter.toString())
    } catch (error) {
      console.error("Failed to save bayanihan counter:", error)
    }
  }, [counter, isLoaded])

  const generateRequestNumber = useCallback(() => {
    const nextNum = counter + 1
    setCounter(nextNum)
    const year = new Date().getFullYear()
    return `BAY-${year}-${String(nextNum).padStart(6, "0")}`
  }, [counter])

  const addRequest = useCallback((requestData: Omit<BayanihanRequest, "id" | "number" | "createdAt" | "updatedAt">) => {
    const newRequest: BayanihanRequest = {
      ...requestData,
      id: crypto.randomUUID(),
      number: generateRequestNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setRequests(prev => [newRequest, ...prev])
    return newRequest
  }, [generateRequestNumber])

  const updateRequest = useCallback((id: string, updates: Partial<BayanihanRequest>) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          ...updates,
          updatedAt: new Date().toISOString(),
          // If status changes to resolved and resolvedAt is not set, set it
          resolvedAt: updates.status === "resolved" && !req.resolvedAt ? new Date().toISOString() : req.resolvedAt
        }
      }
      return req
    }))
  }, [])

  const getRequest = useCallback((id: string) => {
    return requests.find(r => r.id === id)
  }, [requests])

  const getRequestsByStatus = useCallback((status: BayanihanStatus | "all") => {
    if (status === "all") return requests
    return requests.filter(r => r.status === status)
  }, [requests])

  const getRequestsByUrgency = useCallback((urgency: BayanihanUrgency) => {
    return requests.filter(r => r.urgency === urgency)
  }, [requests])

  const getPendingCount = useCallback(() => {
    return requests.filter(r => r.status === "pending").length
  }, [requests])

  const getHighUrgencyCount = useCallback(() => {
    return requests.filter(r => r.urgency === "high" && r.status !== "resolved").length
  }, [requests])

  const value = useMemo(() => ({
    requests,
    addRequest,
    updateRequest,
    getRequest,
    getRequestsByStatus,
    getRequestsByUrgency,
    getPendingCount,
    getHighUrgencyCount
  }), [
    requests,
    addRequest,
    updateRequest,
    getRequest,
    getRequestsByStatus,
    getRequestsByUrgency,
    getPendingCount,
    getHighUrgencyCount
  ])

  return (
    <BayanihanContext.Provider value={value}>
      {children}
    </BayanihanContext.Provider>
  )
})

export function useBayanihan() {
  const context = useContext(BayanihanContext)
  if (context === undefined) {
    throw new Error("useBayanihan must be used within a BayanihanProvider")
  }
  return context
}
