"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useCertificates, type CertificateRequest } from "@/lib/certificate-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  LayoutGrid,
  List,
  ChevronRight,
  Calendar,
  DollarSign,
} from "lucide-react"

export default function StaffCertificatesPage() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated } = useAuth()
  const { certificates, updateCertificateStatus } = useCertificates()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  if (!isStaffAuthenticated) {
    router.push("/staff/login")
    return null
  }

  const filteredCerts = certificates.filter(
    (cert) =>
      cert.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.purpose.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const processingCerts = filteredCerts.filter((c) => c.status === "processing")
  const readyCerts = filteredCerts.filter((c) => c.status === "ready")

  const handleApprove = (id: string) => {
    updateCertificateStatus(id, "ready")
  }

  const CertificateCard = ({ cert, compact = false }: { cert: CertificateRequest; compact?: boolean }) => (
    <Card className={`border-0 shadow-sm ${compact ? "mb-2" : ""}`}>
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-slate-900 ${compact ? "text-sm" : ""}`}>{cert.certificateType}</p>
              {cert.requestType === "rush" && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">RUSH</span>
              )}
            </div>
            <p className={`text-slate-500 ${compact ? "text-xs" : "mt-1 text-sm"}`}>{cert.serialNumber}</p>
            {!compact && (
              <>
                <p className="mt-2 text-sm text-slate-600">{cert.purpose}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(cert.createdAt).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />₱{cert.amount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
          {cert.status === "processing" && (
            <Button
              size="sm"
              onClick={() => handleApprove(cert.id)}
              className={`bg-emerald-600 hover:bg-emerald-700 ${compact ? "h-7 text-xs" : ""}`}
            >
              <CheckCircle2 className={`mr-1 ${compact ? "h-3 w-3" : "h-4 w-4"}`} />
              Approve
            </Button>
          )}
          {cert.status === "ready" && !compact && (
            <Link href={`/certificate/${cert.id}`}>
              <Button size="sm" variant="outline">
                View
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={`/staff/${staffUser?.role}`} className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              <h1 className="text-lg font-semibold text-slate-900">Certificates</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-slate-100" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("kanban")}
              className={viewMode === "kanban" ? "bg-slate-100" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by serial, type, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 px-5 py-6">
        {viewMode === "list" ? (
          <Tabs defaultValue="pending">
            <TabsList className="mb-4 grid w-full grid-cols-2 bg-slate-100">
              <TabsTrigger value="pending" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                Processing ({processingCerts.length})
              </TabsTrigger>
              <TabsTrigger value="ready" className="text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Ready ({readyCerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {processingCerts.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
              {processingCerts.length === 0 && (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
                  <p className="mt-2 text-sm text-slate-500">All caught up! No pending certificates.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-3">
              {readyCerts.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
              {readyCerts.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No certificates ready yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Kanban View
          <div className="grid grid-cols-2 gap-4">
            {/* Processing Column */}
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-900">Processing</h3>
                <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {processingCerts.length}
                </span>
              </div>
              <div className="space-y-2">
                {processingCerts.map((cert) => (
                  <CertificateCard key={cert.id} cert={cert} compact />
                ))}
                {processingCerts.length === 0 && <p className="py-4 text-center text-xs text-amber-600">No pending</p>}
              </div>
            </div>

            {/* Ready Column */}
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-emerald-900">Ready</h3>
                <span className="ml-auto rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  {readyCerts.length}
                </span>
              </div>
              <div className="space-y-2">
                {readyCerts.map((cert) => (
                  <Card key={cert.id} className="mb-2 border-0 shadow-sm">
                    <CardContent className="p-3">
                      <p className="text-sm font-semibold text-slate-900">{cert.certificateType}</p>
                      <p className="text-xs text-slate-500">{cert.serialNumber}</p>
                    </CardContent>
                  </Card>
                ))}
                {readyCerts.length === 0 && <p className="py-4 text-center text-xs text-emerald-600">No ready</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
