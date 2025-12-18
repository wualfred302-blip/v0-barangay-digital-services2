"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useCertificates } from "@/lib/certificate-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, TrendingUp, Banknote, Receipt, Calendar, ArrowUpRight, FileText } from "lucide-react"

export default function TreasurerDashboard() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated, isLoading, staffLogout } = useAuth()
  const { certificates } = useCertificates()
  const [period, setPeriod] = useState<"today" | "week" | "month">("today")

  useEffect(() => {
    if (!isLoading && (!isStaffAuthenticated || staffUser?.role !== "treasurer")) {
      router.push("/staff/login")
    }
  }, [isLoading, isStaffAuthenticated, staffUser, router])

  if (isLoading || !isStaffAuthenticated || staffUser?.role !== "treasurer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  const handleLogout = () => {
    staffLogout()
    router.push("/staff/login")
  }

  // Calculate financial stats
  const totalRevenue = certificates.reduce((sum, c) => sum + c.amount, 0)
  const todayRevenue = certificates
    .filter((c) => new Date(c.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, c) => sum + c.amount, 0)
  const transactionCount = certificates.length
  const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0

  // Group by certificate type
  const revenueByType = certificates.reduce(
    (acc, cert) => {
      acc[cert.certificateType] = (acc[cert.certificateType] || 0) + cert.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-blue-900/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/images/mawaque-20logo.jpeg" alt="Seal" fill className="rounded-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Treasurer</span>
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
          <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
          <p className="mt-1 text-sm text-blue-200">Track revenue and transactions</p>
        </div>

        {/* Main Revenue Card */}
        <Card className="mb-6 border-0 bg-gradient-to-br from-blue-600 to-blue-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Revenue</p>
                <p className="mt-2 text-4xl font-bold text-white">
                  ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-3 flex items-center gap-1 text-sm text-emerald-300">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card className="border-0 bg-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-200">
                <Banknote className="h-4 w-4" />
                <span className="text-xs font-medium">Today</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                ₱{todayRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-200">
                <Receipt className="h-4 w-4" />
                <span className="text-xs font-medium">Transactions</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">{transactionCount}</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-200">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Avg. Amount</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                ₱{averageTransaction.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-200">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">This Month</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Type */}
        <Card className="mb-6 border-0 bg-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Revenue by Certificate Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(revenueByType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                <span className="text-sm font-medium text-white">{type}</span>
                <span className="font-semibold text-emerald-400">
                  ₱{amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {Object.keys(revenueByType).length === 0 && (
              <p className="py-4 text-center text-sm text-blue-200">No transactions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 bg-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.slice(0, 5).map((cert) => (
              <div key={cert.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{cert.certificateType}</p>
                    <p className="text-xs text-blue-200">{cert.serialNumber}</p>
                  </div>
                </div>
                <span className="font-semibold text-emerald-400">
                  +₱{cert.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {certificates.length === 0 && <p className="py-4 text-center text-sm text-blue-200">No transactions yet</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
