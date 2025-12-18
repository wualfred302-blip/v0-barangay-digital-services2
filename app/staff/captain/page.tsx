"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useCertificates } from "@/lib/certificate-context"
import { useBlotters } from "@/lib/blotter-context"
import { useAnnouncements } from "@/lib/announcements-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  FileText,
  AlertTriangle,
  Megaphone,
  BarChart3,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

export default function CaptainDashboard() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated, isLoading, staffLogout } = useAuth()
  const { certificates } = useCertificates()
  const { blotters } = useBlotters()
  const { announcements } = useAnnouncements()

  useEffect(() => {
    if (!isLoading && (!isStaffAuthenticated || staffUser?.role !== "captain")) {
      router.push("/staff/login")
    }
  }, [isLoading, isStaffAuthenticated, staffUser, router])

  if (isLoading || !isStaffAuthenticated || staffUser?.role !== "captain") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  const handleLogout = () => {
    staffLogout()
    router.push("/staff/login")
  }

  // Stats
  const pendingCerts = certificates.filter((c) => c.status === "processing").length
  const completedCerts = certificates.filter((c) => c.status === "ready").length
  const activeBlotters = blotters.filter((b) => !["resolved", "dismissed"].includes(b.status)).length
  const publishedAnnouncements = announcements.filter((a) => a.isPublished).length

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/images/mawaque-20logo.jpeg" alt="Seal" fill className="rounded-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Punong Barangay</span>
              </div>
              <p className="text-sm font-semibold text-white">{staffUser.fullName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/60 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-5 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Good day, Kapitan!</h1>
          <p className="mt-1 text-sm text-slate-400">Executive Dashboard Overview</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                  <FileText className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingCerts}</p>
                  <p className="text-xs text-amber-400/80">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-red-500/20 to-red-600/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeBlotters}</p>
                  <p className="text-xs text-red-400/80">Active Blotters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{completedCerts}</p>
                  <p className="text-xs text-emerald-400/80">Issued Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                  <Megaphone className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{publishedAnnouncements}</p>
                  <p className="text-xs text-blue-400/80">Announcements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="mb-3 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="space-y-3">
          <Link href="/staff/certificates">
            <Card className="border-0 bg-white/5 transition-colors hover:bg-white/10">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                    <FileText className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Approve Certificates</p>
                    <p className="text-xs text-slate-400">{pendingCerts} pending your signature</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff/blotters">
            <Card className="border-0 bg-white/5 transition-colors hover:bg-white/10">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Review Blotters</p>
                    <p className="text-xs text-slate-400">{activeBlotters} cases need attention</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff/reports">
            <Card className="border-0 bg-white/5 transition-colors hover:bg-white/10">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">DILG Reports</p>
                    <p className="text-xs text-slate-400">Generate compliance reports</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff/announcements">
            <Card className="border-0 bg-white/5 transition-colors hover:bg-white/10">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Megaphone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Manage Announcements</p>
                    <p className="text-xs text-slate-400">Approve and publish updates</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6 border-0 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.slice(0, 3).map((cert) => (
              <div key={cert.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      cert.status === "ready" ? "bg-emerald-500/20" : "bg-amber-500/20"
                    }`}
                  >
                    {cert.status === "ready" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{cert.certificateType}</p>
                    <p className="text-xs text-slate-400">{cert.serialNumber}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    cert.status === "ready" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {cert.status}
                </span>
              </div>
            ))}
            {certificates.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No recent activity</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
