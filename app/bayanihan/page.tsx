"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, CheckCircle2, Loader2, Camera, MapPin, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useBayanihan, BayanihanType, BayanihanUrgency } from "@/lib/bayanihan-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"

interface FormData {
  type: BayanihanType | ""
  location: string
  description: string
  urgency: BayanihanUrgency
  photoBase64: string
  contactPreference: boolean
}

export default function BayanihanPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { addRequest } = useBayanihan()

  const [formData, setFormData] = useState<FormData>({
    type: "",
    location: "",
    description: "",
    urgency: "low",
    photoBase64: "",
    contactPreference: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [requestNumber, setRequestNumber] = useState("")

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login")
    }
  }, [user, isAuthLoading, router])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoBase64: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type || !formData.location || !formData.description) return

    setIsLoading(true)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const request = addRequest({
        residentName: user?.fullName || "Anonymous",
        type: formData.type as BayanihanType,
        location: formData.location,
        description: formData.description,
        urgency: formData.urgency,
        photoBase64: formData.photoBase64 || undefined,
        status: "pending",
        contactPreference: formData.contactPreference,
        residentContact: formData.contactPreference ? user?.mobileNumber : undefined,
      })

      setRequestNumber(request.number)
      setIsSuccess(true)
      toast.success("Request submitted", { description: request.number })
    } catch (error) {
      console.error("Failed to submit request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-4 animate-in fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 mb-6 animate-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
        <p className="text-sm text-slate-600 mb-8 text-center">
          The barangay will respond soon.
        </p>

        <Card className="w-full max-w-sm border-0 shadow-md mb-8">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Request Number</span>
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">{requestNumber}</span>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
              Pending Review
            </span>
            <p className="text-xs text-slate-400 mt-2">Save this number for tracking</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button 
            className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm"
            onClick={() => router.push("/dashboard")}
          >
            View My Requests
          </Button>
          <Button 
            variant="outline"
            className="h-12 w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            onClick={() => {
              setIsSuccess(false)
              setFormData({
                type: "",
                location: "",
                description: "",
                urgency: "low",
                photoBase64: "",
                contactPreference: true,
              })
              setRequestNumber("")
            }}
          >
            Submit Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-100 bg-white px-4 shadow-sm">
        <Link href="/dashboard">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <h1 className="text-base font-semibold text-slate-900">Request Community Help</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Request Type */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <Label className="text-slate-900">Request Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as BayanihanType }))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="What kind of help do you need?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infrastructure Issue">Infrastructure Issue</SelectItem>
                  <SelectItem value="Road/Street Problem">Road/Street Problem</SelectItem>
                  <SelectItem value="Lighting Issue">Lighting Issue</SelectItem>
                  <SelectItem value="Flooding/Drainage">Flooding/Drainage</SelectItem>
                  <SelectItem value="Community Cleanup Needed">Community Cleanup Needed</SelectItem>
                  <SelectItem value="Emergency Assistance">Emergency Assistance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <Label className="text-slate-900">Location</Label>
              </div>
              <p className="text-xs text-slate-500 -mt-2">Where is this happening?</p>
              <Input 
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="h-10 rounded-xl bg-slate-50 border-slate-200"
                placeholder="Street name, Purok, or landmark"
              />
              <p className="text-xs text-slate-400">e.g., Main Road near Purok 3</p>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <Label className="text-slate-900">Description</Label>
              <p className="text-xs text-slate-500 -mt-2">Describe the issue in detail</p>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="rounded-xl bg-slate-50 border-slate-200 resize-none"
                placeholder="Please provide as much detail as possible..."
                maxLength={500}
              />
              <div className="flex justify-end">
                <span className="text-xs text-slate-400">{formData.description.length}/500</span>
              </div>
            </CardContent>
          </Card>

          {/* Urgency Level */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <Label className="text-slate-900">Urgency Level</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: "low" }))}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-colors ${
                    formData.urgency === "low"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${formData.urgency === "low" ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${formData.urgency === "low" ? "text-slate-900" : "text-slate-600"}`}>Low</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Can wait</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: "medium" }))}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-colors ${
                    formData.urgency === "medium"
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${formData.urgency === "medium" ? "text-amber-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${formData.urgency === "medium" ? "text-slate-900" : "text-slate-600"}`}>Medium</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Soon</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: "high" }))}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-colors ${
                    formData.urgency === "high"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${formData.urgency === "high" ? "text-red-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${formData.urgency === "high" ? "text-slate-900" : "text-slate-600"}`}>High</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Urgent</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <Label className="text-slate-900">Photo (Optional)</Label>
              <p className="text-xs text-slate-500 -mt-2">Add a photo to help us understand</p>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="photo-upload"
                onChange={handleFileChange}
              />
              
              {!formData.photoBase64 ? (
                <label 
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center h-32 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Add Photo</span>
                </label>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={formData.photoBase64} 
                    alt="Preview" 
                    className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-black/90 transition-colors"
                  >
                    Change Photo
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Preference */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-900">Contact me for updates</Label>
                <p className="text-sm text-slate-600">{user?.mobileNumber || "No number linked"}</p>
              </div>
              <Switch 
                checked={formData.contactPreference}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contactPreference: checked }))}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit"
            disabled={isLoading || !formData.type || !formData.location || !formData.description || formData.location.length < 5 || formData.description.length < 20}
            className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md disabled:opacity-50 disabled:shadow-none mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>

          {/* Validation Errors Inline */}
          {(!formData.location || formData.location.length < 5) && formData.location.length > 0 && (
             <p className="text-xs text-red-500 text-center">Location must be at least 5 characters</p>
          )}
          {(!formData.description || formData.description.length < 20) && formData.description.length > 0 && (
             <p className="text-xs text-red-500 text-center">Description must be at least 20 characters</p>
          )}

        </form>
      </main>

      <BottomNav />
    </div>
  )
}
