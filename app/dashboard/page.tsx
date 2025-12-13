"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, ClipboardList, User, Settings, Grid3X3, Bell, Phone, MapPin, ChevronRight } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#10B981] border-t-transparent" />
      </div>
    )
  }

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image src="/images/image.png" alt="Barangay Seal" fill className="object-contain" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#111827]">Barangay Mawaque</p>
            <p className="text-[13px] font-medium text-[#6B7280]">Digital Services</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#374151] transition-colors hover:text-[#111827]">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pb-28 pt-5">
        {/* Welcome Card */}
        <Card className="mb-8 rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#6B7280]">Welcome back,</p>
                <h2 className="mt-1 text-2xl font-bold text-[#111827]">{user.fullName}</h2>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#374151]">
                    <Phone className="h-4 w-4 text-[#6B7280]" />
                    <span>{user.mobileNumber}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#374151]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]" />
                    <span className="max-w-[200px]">{user.address}</span>
                  </div>
                </div>
              </div>
              {/* Avatar */}
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E0F2FE]">
                <span className="text-2xl font-semibold text-[#0369A1]">{initials}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Heading */}
        <h3 className="mb-4 text-[22px] font-bold text-[#111827]">Available Services</h3>

        {/* Main Service Card - Request Certificate */}
        <Link href="/request" className="block">
          <Card className="group mb-4 h-[160px] overflow-hidden rounded-[20px] border-0 bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_4px_6px_rgba(16,185,129,0.15)] transition-all active:scale-[0.98]">
            <CardContent className="relative flex h-full flex-col justify-between p-6">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              {/* Text */}
              <div>
                <h4 className="text-[22px] font-bold text-white">Request Certificate</h4>
                <p className="mt-1 text-sm font-medium text-white/90">Clearance, Residency, Indigency</p>
              </div>
              {/* Arrow */}
              <ChevronRight className="absolute bottom-6 right-6 h-6 w-6 text-white" />
            </CardContent>
          </Card>
        </Link>

        {/* Secondary Services Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/requests" className="block">
            <Card className="h-[120px] rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] active:scale-[0.98]">
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7]">
                  <ClipboardList className="h-5 w-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#111827]">My Requests</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">View history</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile" className="block">
            <Card className="h-[120px] rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] active:scale-[0.98]">
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE]">
                  <User className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#111827]">Profile</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">Update info</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/install" className="block">
            <Card className="h-[120px] rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] active:scale-[0.98]">
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0E7FF]">
                  <Settings className="h-5 w-5 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#111827]">Settings</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">Preferences</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/install" className="block">
            <Card className="h-[120px] rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] active:scale-[0.98]">
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF]">
                  <Grid3X3 className="h-5 w-5 text-[#9333EA]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#111827]">More</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">Install app</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
