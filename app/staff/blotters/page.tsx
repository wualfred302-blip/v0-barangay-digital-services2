"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useBlotters, type BlotterStatus } from "@/lib/blotter-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Filter, AlertTriangle, Calendar, MapPin, User } from "lucide-react"

const STATUS_OPTIONS: { value: BlotterStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "bg-slate-100 text-slate-700" },
  { value: "filed", label: "Filed", color: "bg-amber-100 text-amber-700" },
  { value: "under_investigation", label: "Under Investigation", color: "bg-blue-100 text-blue-700" },
  { value: "scheduled_mediation", label: "Scheduled Mediation", color: "bg-purple-100 text-purple-700" },
  { value: "resolved", label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
  { value: "escalated", label: "Escalated", color: "bg-red-100 text-red-700" },
  { value: "dismissed", label: "Dismissed", color: "bg-slate-100 text-slate-500" },
]

export default function StaffBlottersPage() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated } = useAuth()
  const { blotters, updateBlotter } = useBlotters()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BlotterStatus | "all">("all")
  const [selectedBlotter, setSelectedBlotter] = useState<string | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")

  if (!isStaffAuthenticated) {
    router.push("/staff/login")
    return null
  }

  const filteredBlotters = blotters.filter((b) => {
    const matchesSearch =
      b.blotterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.complainantName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (blotterId: string, newStatus: BlotterStatus) => {
    updateBlotter(blotterId, {
      status: newStatus,
      resolvedAt: newStatus === "resolved" ? new Date().toISOString() : undefined,
      resolutionNotes: newStatus === "resolved" ? resolutionNotes : undefined,
    })
    setSelectedBlotter(null)
    setResolutionNotes("")
  }

  const getStatusColor = (status: BlotterStatus) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color || "bg-slate-100 text-slate-700"
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href={`/staff/${staffUser?.role}`} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h1 className="text-lg font-semibold text-slate-900">Blotter Management</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-5 py-6">
        {/* Stats */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-amber-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-900">{blotters.filter((b) => b.status === "filed").length}</p>
              <p className="text-xs text-amber-700">New Filed</p>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-blue-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-900">
                {blotters.filter((b) => b.status === "under_investigation").length}
              </p>
              <p className="text-xs text-blue-700">Investigating</p>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-emerald-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-900">
                {blotters.filter((b) => b.status === "resolved").length}
              </p>
              <p className="text-xs text-emerald-700">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search blotters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BlotterStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Blotter List */}
        <div className="space-y-3">
          {filteredBlotters.map((blotter) => (
            <Card key={blotter.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{blotter.blotterNumber}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(blotter.status)}`}
                      >
                        {blotter.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">{blotter.incidentType}</p>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{blotter.isAnonymous ? "Anonymous Report" : blotter.complainantName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(blotter.incidentDate).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{blotter.incidentLocation}</span>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">{blotter.narrative}</p>
                  </div>
                </div>

                {/* Actions */}
                {!["resolved", "dismissed"].includes(blotter.status) && (
                  <div className="mt-4 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setSelectedBlotter(blotter.id)}
                        >
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Blotter Status</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.filter((s) => s.value !== "all" && s.value !== blotter.status).map(
                              (status) => (
                                <Button
                                  key={status.value}
                                  variant="outline"
                                  size="sm"
                                  className={`justify-start ${status.color}`}
                                  onClick={() => {
                                    if (status.value === "resolved") {
                                      setSelectedBlotter(blotter.id)
                                    } else {
                                      handleStatusChange(blotter.id, status.value as BlotterStatus)
                                    }
                                  }}
                                >
                                  {status.label}
                                </Button>
                              ),
                            )}
                          </div>
                          {selectedBlotter === blotter.id && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Resolution Notes</p>
                              <Textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Describe how this case was resolved..."
                                rows={3}
                              />
                              <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleStatusChange(blotter.id, "resolved")}
                              >
                                Mark as Resolved
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {blotter.status === "resolved" && blotter.resolutionNotes && (
                  <div className="mt-4 rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs font-medium text-emerald-800">Resolution Notes:</p>
                    <p className="mt-1 text-sm text-emerald-700">{blotter.resolutionNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredBlotters.length === 0 && (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No blotters found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
