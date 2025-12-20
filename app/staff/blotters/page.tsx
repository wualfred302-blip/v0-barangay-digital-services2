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
import { ArrowLeft, Search, Filter, AlertTriangle, Calendar, MapPin, User, Users } from "lucide-react"

const STATUS_OPTIONS: { value: BlotterStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "bg-slate-100 text-slate-700" },
  { value: "filed", label: "Filed", color: "bg-amber-100 text-amber-700" },
  { value: "under_investigation", label: "Under Investigation", color: "bg-blue-100 text-blue-700" },
  { value: "scheduled_mediation", label: "Scheduled Mediation", color: "bg-purple-100 text-purple-700" },
  { value: "resolved", label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
  { value: "escalated", label: "Escalated", color: "bg-red-100 text-red-700" },
  { value: "dismissed", label: "Dismissed", color: "bg-slate-100 text-slate-500" },
]

const INCIDENT_TYPES = [
  "Noise Complaint",
  "Property Dispute",
  "Physical Altercation",
  "Verbal Abuse",
  "Theft",
  "Vandalism",
  "Domestic Dispute",
  "Trespassing",
  "Animal Complaint",
  "Infrastructure/Lighting Complaint",
  "Other",
]

export default function StaffBlottersPage() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated } = useAuth()
  const { blotters, updateBlotter, addBlotter } = useBlotters()
  const [searchTerm, setSearchTerm] = useState("")
  const [isBayanihanOpen, setIsBayanihanOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<BlotterStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
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
    const matchesType = typeFilter === "all" || b.incidentType === typeFilter
    return matchesSearch && matchesStatus && matchesType
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {INCIDENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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

      {/* Bayanihan FAB */}
      {(staffUser?.role === "captain" || staffUser?.role === "secretary") && (
        <>
          <Dialog open={isBayanihanOpen} onOpenChange={setIsBayanihanOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0">
              <DialogHeader className="p-6 border-b border-slate-100 bg-white">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Users className="h-6 w-6 text-emerald-600" />
                  Bayanihan Mediation Request
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 space-y-4 bg-white">
                <p className="text-sm text-slate-600">
                  Request community mediation for neighborhood cooperation and peaceful resolution.
                </p>
                <Button
                  onClick={() => {
                    addBlotter({
                      complainantName: staffUser.fullName,
                      incidentType: "Bayanihan Mediation",
                      incidentDate: new Date().toISOString().split("T")[0],
                      incidentLocation: "Barangay Mawaque",
                      narrative: "Community bayanihan request - needs captain/secretary review.",
                      status: "scheduled_mediation" as BlotterStatus,
                      isAnonymous: true,
                    })
                    setIsBayanihanOpen(false)
                  }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg text-white font-semibold transition-all"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Initiate Bayanihan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <button
            className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-200 hover:-translate-y-1 animate-pop-in md:bottom-6 md:right-6"
            onClick={() => setIsBayanihanOpen(true)}
            aria-label="Mabayanihan - Community Action"
          >
            <Users className="h-6 w-6 drop-shadow-md" />
          </button>

          <style jsx>{`
            @keyframes pop-in {
              0% { opacity: 0; transform: scale(0.5) translate(50%, 50%); }
              100% { opacity: 1; transform: scale(1) translate(0, 0); }
            }
            .animate-pop-in {
              animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
          `}</style>
        </>
      )}
    </div>
  )
}
