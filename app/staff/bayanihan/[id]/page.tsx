"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useBayanihan } from "@/lib/bayanihan-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  HandHeart, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Maximize, 
  Loader2, 
  AlertCircle 
} from "lucide-react"

export default function BayanihanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { staffUser, isStaffAuthenticated, isLoading: authLoading } = useAuth()
  const { getRequest, updateRequest } = useBayanihan()
  
  const [request, setRequest] = useState<ReturnType<typeof getRequest>>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  // Form states
  const [assignedTo, setAssignedTo] = useState("")
  const [assignNotes, setAssignNotes] = useState("")
  const [progressNotes, setProgressNotes] = useState("")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [resolutionDate, setResolutionDate] = useState(new Date().toISOString().split('T')[0])
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (authLoading) return

    if (!isStaffAuthenticated) {
      router.push("/staff/login")
      return
    }

    if (params.id) {
        const req = getRequest(params.id as string)
        setRequest(req)
        setIsLoading(false)
        
        // Initialize form states if request exists
        if (req) {
            setAssignedTo(req.assignedTo || "")
            setResolutionNotes(req.resolutionNotes || "")
            setRejectionReason(req.rejectionReason || "")
        }
    }
  }, [params.id, getRequest, isStaffAuthenticated, router, authLoading])

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Request Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">This bayanihan request does not exist.</p>
        <Link href="/staff/bayanihan">
          <Button>Back to Requests</Button>
        </Link>
      </div>
    )
  }

  const handleAssign = () => {
    if (!request) return
    updateRequest(request.id, { 
      status: "in_progress", 
      assignedTo: assignedTo,
    })
    setAssignModalOpen(false)
    toast.success(`Request assigned to ${assignedTo}`, { description: request.number })
  }

  const handleProgress = () => {
    if (!request) return
    if (request.status === "pending") {
        updateRequest(request.id, { status: "in_progress" })
        toast.success("Request marked in progress", { description: request.number })
    } else {
        const newDescription = request.description + `\n\n[Update ${new Date().toLocaleString('en-PH')}]: ${progressNotes}`
        updateRequest(request.id, { description: newDescription })
        toast.success("Update added", { description: request.number })
    }
    setProgressModalOpen(false)
    setProgressNotes("")
  }

  const handleResolve = () => {
    if (!request) return
    updateRequest(request.id, { 
        status: "resolved", 
        resolutionNotes, 
        resolvedAt: new Date().toISOString() 
    })
    setResolveModalOpen(false)
    toast.success("Request resolved", { description: request.number })
  }

  const handleReject = () => {
    if (!request) return
    updateRequest(request.id, { 
        status: "rejected", 
        rejectionReason 
    })
    setRejectModalOpen(false)
    toast.success("Request rejected", { description: request.number })
  }

  // Role based checks
  const isCaptain = staffUser?.role === "captain"
  const isSecretary = staffUser?.role === "secretary"
  const isTreasurer = staffUser?.role === "treasurer"
  const isBudgetRelated = request.type === "Infrastructure Issue" || request.type === "Emergency Assistance"
  
  const canAct = isCaptain || isSecretary || (isTreasurer && isBudgetRelated)
  const canAssign = isCaptain
  const canReject = isCaptain

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/staff/bayanihan" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-semibold text-slate-900">{request.number}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-4">
        
        {/* Request Info Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
               <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                 {request.type}
               </span>
               <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                 request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                 request.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                 'bg-emerald-100 text-emerald-700'
               }`}>
                 {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Urgency
               </span>
            </div>

            <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>{request.location}</span>
            </div>

            <div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">Description</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{request.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Photo Section */}
        {request.photoBase64 && (
            <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Photo Evidence</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                <img 
                    src={request.photoBase64} 
                    alt="Request photo"
                    className="h-full w-full object-cover"
                />
                </div>
                <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                onClick={() => window.open(request.photoBase64, '_blank')}
                >
                <Maximize className="mr-2 h-4 w-4" />
                View Full Size
                </Button>
            </CardContent>
            </Card>
        )}

        {/* Resident Contact Card */}
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Resident Information</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">{request.residentName}</p>
                    </div>
                    {request.contactPreference && request.residentContact && (
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-slate-600" />
                            </div>
                            <p className="text-sm text-slate-600">{request.residentContact}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {/* Created */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  {request.status !== 'pending' && <div className="w-0.5 h-full bg-slate-200 min-h-[20px]" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-slate-900">Request Created</p>
                  <p className="text-xs text-slate-500">
                    {new Date(request.createdAt).toLocaleString('en-PH')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">by {request.residentName}</p>
                </div>
              </div>

              {/* In Progress (if applicable) */}
              {request.status !== 'pending' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    {(request.status === 'resolved' || request.status === 'rejected') && <div className="w-0.5 h-full bg-slate-200 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-slate-900">In Progress</p>
                    <p className="text-xs text-slate-500">
                      {new Date(request.updatedAt).toLocaleString('en-PH')}
                    </p>
                    {request.assignedTo && (
                      <p className="text-xs text-slate-600 mt-1">Assigned to {request.assignedTo}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resolved/Rejected (if applicable) */}
              {(request.status === 'resolved' || request.status === 'rejected') && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100">
                    {request.status === 'resolved' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {request.status === 'resolved' ? 'Resolved' : 'Rejected'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.resolvedAt ? new Date(request.resolvedAt).toLocaleString('en-PH') : new Date(request.updatedAt).toLocaleString('en-PH')}
                    </p>
                    {request.resolutionNotes && (
                      <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                        {request.resolutionNotes}
                      </p>
                    )}
                    {request.rejectionReason && (
                      <p className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                        {request.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Footer Actions */}
      {canAct && request.status !== 'resolved' && request.status !== 'rejected' && (
          <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-3">
                  {request.status === 'pending' ? (
                      <>
                        {(canAssign) ? (
                            <Button 
                                onClick={() => setAssignModalOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl"
                            >
                                Assign Request
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => setProgressModalOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl"
                            >
                                Mark In Progress
                            </Button>
                        )}
                        
                        {canReject && (
                            <Button 
                                variant="destructive"
                                onClick={() => setRejectModalOpen(true)}
                                className="h-12 rounded-xl bg-red-500 hover:bg-red-600"
                            >
                                Reject Request
                            </Button>
                        )}
                      </>
                  ) : (
                      <>
                        <Button 
                            variant="outline"
                            onClick={() => setProgressModalOpen(true)}
                            className="h-12 rounded-xl border-2"
                        >
                            Add Update
                        </Button>
                        <Button 
                            onClick={() => setResolveModalOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl"
                        >
                            Mark as Resolved
                        </Button>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
            <DialogTitle>Assign Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
            <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select staff/team" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Maintenance Team">Maintenance Team</SelectItem>
                        <SelectItem value="Barangay Tanod">Barangay Tanod</SelectItem>
                        <SelectItem value="Kagawad Santos">Kagawad Santos</SelectItem>
                        <SelectItem value="Kagawad Reyes">Kagawad Reyes</SelectItem>
                        <SelectItem value="Engineering Team">Engineering Team</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                    placeholder="Assignment notes" 
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                />
            </div>
            <Button onClick={handleAssign} disabled={!assignedTo} className="w-full bg-emerald-500">
                Assign Request
            </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Progress Modal */}
      <Dialog open={progressModalOpen} onOpenChange={setProgressModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
            <DialogTitle>
                {request.status === 'pending' ? 'Start Progress' : 'Add Update'}
            </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                {request.status === 'pending' ? (
                    <p className="text-slate-600">
                        Are you sure you want to mark this request as "In Progress"?
                    </p>
                ) : (
                    <div className="space-y-2">
                        <Label>Progress Update</Label>
                        <Textarea 
                            placeholder="Enter progress details..." 
                            value={progressNotes}
                            onChange={(e) => setProgressNotes(e.target.value)}
                            rows={4}
                        />
                        <p className="text-xs text-slate-500">
                            Update will be recorded at {new Date().toLocaleString('en-PH')}
                        </p>
                    </div>
                )}
                <Button 
                    onClick={handleProgress} 
                    className="w-full bg-emerald-500"
                    disabled={request.status !== 'pending' && !progressNotes.trim()}
                >
                    {request.status === 'pending' ? 'Start Progress' : 'Add Update'}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Resolution Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Mark as Resolved
            </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
            <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Textarea 
                    placeholder="How was this resolved? (required)"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                />
            </div>
            <div className="space-y-2">
                <Label>Resolution Date</Label>
                <Input 
                    type="date" 
                    value={resolutionDate}
                    onChange={(e) => setResolutionDate(e.target.value)}
                />
            </div>
            <Button 
                onClick={handleResolve}
                disabled={!resolutionNotes.trim()}
                className="w-full bg-emerald-500"
            >
                Mark as Resolved
            </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Reject Request
            </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Please provide a reason for rejecting this request.
            </p>
            <Textarea 
                placeholder="Rejection reason (required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
            />
            <div className="flex gap-2">
                <Button 
                variant="outline" 
                onClick={() => setRejectModalOpen(false)}
                className="flex-1"
                >
                Cancel
                </Button>
                <Button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600"
                >
                Reject Request
                </Button>
            </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
