"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Phone, Lock } from "lucide-react"
import { useCertificates, type CertificateRequest } from "@/lib/certificate-context"

export default function PaymentPage() {
  const router = useRouter()
  const { currentRequest, addCertificate, setCurrentRequest } = useCertificates()
  const [mobileNumber, setMobileNumber] = useState("")
  const [pin, setPin] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!currentRequest) {
      router.push("/request")
    }
  }, [currentRequest, router])

  if (!currentRequest) return null

  const generateSerial = () => {
    const year = new Date().getFullYear()
    const existingCerts = JSON.parse(localStorage.getItem("barangay_certificates") || "[]")
    const nextNum = existingCerts.length + 1
    return `BGRY-MWQ-${year}-${String(nextNum).padStart(6, "0")}`
  }

  const handleConfirmPayment = () => {
    setIsProcessing(true)

    setTimeout(() => {
      const serial = generateSerial()
      const certId = `cert_${Date.now()}`
      setIsSuccess(true)

      const newCertificate: CertificateRequest = {
        id: certId,
        certificateType: currentRequest.certificateType || "Barangay Clearance",
        purpose: currentRequest.purpose || "Employment",
        customPurpose: currentRequest.customPurpose,
        requestType: currentRequest.requestType || "regular",
        amount: currentRequest.amount || 50,
        paymentReference: `GC-${Date.now()}`,
        serialNumber: serial,
        status: "ready",
        createdAt: new Date().toISOString(),
        age: currentRequest.age,
        purok: currentRequest.purok,
        yearsOfResidency: currentRequest.yearsOfResidency,
      }

      addCertificate(newCertificate)

      // Redirect directly to certificate after 2 seconds
      setTimeout(() => {
        setCurrentRequest(null)
        router.push(`/certificate/${certId}`)
      }, 2000)
    }, 2000)
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-6">
        <Card className="w-full max-w-[400px] rounded-2xl border-0 shadow-[0_4px_6px_rgba(0,0,0,0.07)]">
          <CardContent className="px-8 py-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#10B981]">
                <Check className="h-8 w-8 text-[#10B981]" strokeWidth={3} />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#111827]">Payment Successful!</h2>
            <p className="mb-6 text-[#6B7280]">Your certificate is ready</p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full w-full animate-pulse bg-[#10B981]" />
            </div>
            <p className="mt-4 text-sm text-[#9CA3AF]">Redirecting to your certificate...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-5">
        <Link href="/request" className="rounded-lg p-1 transition-colors hover:bg-[#F9FAFB]">
          <ArrowLeft className="h-5 w-5 text-[#374151]" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/images/image.png" alt="Barangay Seal" fill className="object-contain" />
          </div>
          <h1 className="text-lg font-semibold text-[#111827]">Payment</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-5">
        {/* Order Summary */}
        <Card className="mb-5 rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Certificate</span>
              <span className="font-medium text-[#111827]">{currentRequest.certificateType}</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Purpose</span>
              <span className="font-medium text-[#111827]">{currentRequest.purpose}</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Processing</span>
              <span className="font-medium capitalize text-[#111827]">{currentRequest.requestType}</span>
            </div>
            <div className="border-t border-[#E5E7EB] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#111827]">Total</span>
                <span className="text-2xl font-bold text-[#10B981]">₱{currentRequest.amount?.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="mb-5 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-[#10B981]" />
          <div className="h-1 flex-1 rounded-full bg-[#10B981]" />
          <div className="h-1 flex-1 rounded-full bg-[#E5E7EB]" />
        </div>

        {/* GCash Payment Card */}
        <Card className="mb-5 overflow-hidden rounded-2xl border-0 bg-[#007DFE] shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-[#007DFE]">
                G
              </div>
              <span className="text-lg font-bold text-white">GCash</span>
            </div>
            <p className="mb-6 text-sm text-white/80">Enter your GCash details to complete payment</p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-white/80">Mobile Number</Label>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/10 px-4">
                  <Phone className="h-4 w-4 text-white/60" />
                  <Input
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    disabled={isProcessing}
                    className="h-12 border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-white/80">GCash PIN</Label>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/10 px-4">
                  <Lock className="h-4 w-4 text-white/60" />
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="****"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={isProcessing}
                    className="h-12 border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="h-14 w-full rounded-xl bg-[#10B981] text-base font-semibold text-white hover:bg-[#059669]"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : (
            `Pay ₱${currentRequest.amount?.toFixed(2)}`
          )}
        </Button>

        <p className="mt-4 pb-6 text-center text-xs text-[#9CA3AF]">
          This is a demo. No actual transaction will be processed.
        </p>
      </main>
    </div>
  )
}
