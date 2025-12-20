"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useBayanihan, type BayanihanStatus, type BayanihanUrgency, type BayanihanType } from "@/lib/bayanihan-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, MapPin, Calendar, HandHeart, AlertCircle } from "lucide-react"

const STATUS_OPTIONS: { value: BayanihanStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "bg-slate-100 text-slate-700" },
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "resolved", label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
]

const URGENCY_OPTIONS: { value: BayanihanUrgency | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Urgency", color: "text-slate-700" },
  { value: "low", label: "Low", color: "text-emerald-600" },
  { value: "medium", label: "Medium", color: "text-amber-600" },
  { value: "high", label: "High", color: "text-red-600" },
]

const TYPE_OPTIONS: { value: BayanihanType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "Infrastructure Issue", label: "Infrastructure" },
  { value: "Road/Street Problem", label: "Road/Street" },
  { value: "Lighting Issue", label: "Lighting" },
  { value: "Flooding/Drainage", label: "Flooding" },
  { value: "Community Cleanup Needed", label: "Cleanup" },
  { value: "Emergency Assistance", label: "Emergency" },
  { value: "Other", label: "Other" },
]

export default function StaffBayanihanPage() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated } = useAuth()
  const { requests, getPendingCount, getHighUrgencyCount } = useBayanihan()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BayanihanStatus | "all">("all")
  const [urgencyFilter, setUrgencyFilter] = useState<BayanihanUrgency | "all">("all")
  const [typeFilter, setTypeFilter] = useState<BayanihanType | "all">("all")

  if (!isStaffAuthenticated) {
    router.push("/staff/login")
    return null
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || req.urgency === urgencyFilter
    const matchesType = typeFilter === "all" || req.type === typeFilter

    return matchesSearch && matchesStatus && matchesUrgency && matchesType
  })

  const getUrgencyBadgeColor = (urgency: BayanihanUrgency) => {
    switch (urgency) {
      case "low": return "bg-emerald-100 text-emerald-700"
      case "medium": return "bg-amber-100 text-amber-700"
      case "high": return "bg-red-100 text-red-700"
      default: return "bg-slate-100 text-slate-700"
    }
  }

  const getStatusBadgeColor = (status: BayanihanStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-slate-100 text-slate-700"
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
            <HandHeart className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-semibold text-slate-900">Bayanihan Requests</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-5 py-6">
        {/* Stats */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-amber-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-900">{getPendingCount()}</p>
              <p className="text-xs text-amber-700">Pending</p>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-blue-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-900">
                {requests.filter(r => r.status === "in_progress").length}
              </p>
              <p className="text-xs text-blue-700">In Progress</p>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-red-50">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-red-900">{getHighUrgencyCount()}</p>
                {getHighUrgencyCount() > 0 && <AlertCircle className="h-4 w-4 text-red-600" />}
              </div>
              <p className="text-xs text-red-700">Urgent</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by number or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BayanihanStatus | "all")}>
              <SelectTrigger className="w-[140px] flex-shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as BayanihanUrgency | "all")}>
              <SelectTrigger className="w-[120px] flex-shrink-0">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className={option.color}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BayanihanType | "all")}>
              <SelectTrigger className="w-[160px] flex-shrink-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{request.number}</p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          {TYPE_OPTIONS.find(t => t.value === request.type)?.label || request.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyBadgeColor(request.urgency)}`}>
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Urgency
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(request.createdAt).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className={`inline-block h-2 w-2 rounded-full ${
                           request.status === 'pending' ? 'bg-amber-500' :
                           request.status === 'in_progress' ? 'bg-blue-500' :
                           request.status === 'resolved' ? 'bg-emerald-500' : 'bg-red-500'
                         }`} />
                        <span className="capitalize">{request.status.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {request.description}
                    </p>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full md:w-auto"
                      onClick={() => router.push(`/staff/bayanihan/${request.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <div className="py-12 text-center">
              <HandHeart className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No bayanihan requests found</p>
              {(searchTerm || statusFilter !== "all" || urgencyFilter !== "all" || typeFilter !== "all") && (
                <Button 
                  variant="link" 
                  className="mt-1 text-emerald-600"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setUrgencyFilter("all")
                    setTypeFilter("all")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
