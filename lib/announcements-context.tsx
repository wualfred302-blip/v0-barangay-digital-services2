"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type AnnouncementCategory = "general" | "health" | "emergency" | "event" | "notice"
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent"

export interface Announcement {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  imageUrl?: string
  isPublished: boolean
  isPinned: boolean
  authorId?: string
  authorName?: string
  approvedBy?: string
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface AnnouncementsContextType {
  announcements: Announcement[]
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt">) => Announcement
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void
  deleteAnnouncement: (id: string) => void
  getPublishedAnnouncements: () => Announcement[]
  getAnnouncement: (id: string) => Announcement | undefined
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined)

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("barangay_announcements")
    if (stored) {
      setAnnouncements(JSON.parse(stored))
    } else {
      // Seed with sample announcements
      const sampleAnnouncements: Announcement[] = [
        {
          id: "1",
          title: "Free Medical Mission",
          content:
            "The barangay will host a free medical mission on January 25, 2025. Services include general consultation, dental checkup, and free medicines. Open to all residents.",
          category: "health",
          priority: "high",
          isPublished: true,
          isPinned: true,
          authorName: "Maria Cruz",
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Barangay Assembly Meeting",
          content:
            "All residents are invited to attend the quarterly barangay assembly on February 1, 2025 at 2:00 PM at the Barangay Hall. Important updates will be discussed.",
          category: "event",
          priority: "normal",
          isPublished: true,
          isPinned: false,
          authorName: "Maria Cruz",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          title: "Water Service Interruption",
          content:
            "Please be advised that there will be a scheduled water service interruption on January 20, 2025 from 8:00 AM to 5:00 PM due to pipe repairs.",
          category: "notice",
          priority: "urgent",
          isPublished: true,
          isPinned: false,
          authorName: "Maria Cruz",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]
      setAnnouncements(sampleAnnouncements)
      localStorage.setItem("barangay_announcements", JSON.stringify(sampleAnnouncements))
    }
  }, [])

  const addAnnouncement = (data: Omit<Announcement, "id" | "createdAt" | "updatedAt">) => {
    const newAnnouncement: Announcement = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newAnnouncement, ...announcements]
    setAnnouncements(updated)
    localStorage.setItem("barangay_announcements", JSON.stringify(updated))
    return newAnnouncement
  }

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a,
    )
    setAnnouncements(updated)
    localStorage.setItem("barangay_announcements", JSON.stringify(updated))
  }

  const deleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id)
    setAnnouncements(updated)
    localStorage.setItem("barangay_announcements", JSON.stringify(updated))
  }

  const getPublishedAnnouncements = () => {
    return announcements
      .filter((a) => a.isPublished && (!a.expiresAt || new Date(a.expiresAt) > new Date()))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
      })
  }

  const getAnnouncement = (id: string) => announcements.find((a) => a.id === id)

  return (
    <AnnouncementsContext.Provider
      value={{
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        getPublishedAnnouncements,
        getAnnouncement,
      }}
    >
      {children}
    </AnnouncementsContext.Provider>
  )
}

export function useAnnouncements() {
  const context = useContext(AnnouncementsContext)
  if (context === undefined) {
    throw new Error("useAnnouncements must be used within an AnnouncementsProvider")
  }
  return context
}
