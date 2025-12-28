"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Share2, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Ruler, 
  Weight,
  Check,
  Printer
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useAuth } from "@/lib/auth-context"
import { useQRT } from "@/lib/qrt-context"
import { cn } from "@/lib/utils"
import { QRTStatusBadge } from "@/components/qrt-status-badge"
import { IDCardPreview } from "@/components/id-card-preview"

export default function QrtIdDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { getQRTById } = useQRT()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [qrtId, setQrtId] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [showBackSide, setShowBackSide] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [baseUrl, setBaseUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const found = getQRTById(id)
    if (found) {
      setQrtId(found)
    }
    setLoading(false)
  }, [id, getQRTById])

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const handleShare = async () => {
    if (!qrtId || !baseUrl) return
    const url = `${baseUrl}/verify/qrt/${qrtId.qrtCode}`
    const shareData = {
      title: `QRT ID - ${qrtId.fullName}`,
      text: `Verify my Barangay Mawaque QRT ID: ${qrtId.qrtCode}`,
      url: url
    }

    try {
      // Try Web Share API first (better for mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      }
    } catch (err) {
      // If share was cancelled or failed, try clipboard
      if ((err as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url)
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)
        } catch (clipErr) {
          console.error("Failed to copy link", clipErr)
        }
      }
    }
  }

  const handlePrint = () => {
    if (!qrtId) return

    // Create a printable window with both sides of the ID
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      alert('Please allow popups to print your ID')
      return
    }

    const frontImage = qrtId.idFrontImageUrl
    const backImage = qrtId.idBackImageUrl

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QRT ID - ${qrtId.fullName}</title>
          <style>
            @media print {
              @page { margin: 0.5in; size: landscape; }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .id-container {
              display: flex;
              flex-direction: column;
              gap: 30px;
              align-items: center;
            }
            .id-card {
              width: 428px;
              height: 270px;
              border: 2px solid #333;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .id-card img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .id-card-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              color: #0369a1;
            }
            .label {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
              font-weight: 600;
            }
            h1 {
              margin-bottom: 20px;
              color: #1f2937;
            }
            .info {
              margin-top: 20px;
              font-size: 14px;
              color: #4b5563;
            }
            .print-btn {
              margin-top: 20px;
              padding: 12px 32px;
              background: #10b981;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
            }
            .print-btn:hover { background: #059669; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <h1>QRT ID Card - ${qrtId.qrtCode}</h1>
          <div class="id-container">
            <div>
              <div class="label">FRONT SIDE</div>
              <div class="id-card">
                ${frontImage
                  ? `<img src="${frontImage}" alt="Front of ID" />`
                  : `<div class="id-card-placeholder">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM9 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 5H6v-1c0-1.3 2.7-2 4-2s4 .7 4 2v1zm5-3h-4v-1h4v1zm0-2h-4v-1h4v1zm0-2h-4V9h4v1z"/>
                      </svg>
                      <p style="margin-top:8px;">Front Side - ${qrtId.fullName}</p>
                    </div>`
                }
              </div>
            </div>
            <div>
              <div class="label">BACK SIDE</div>
              <div class="id-card">
                ${backImage
                  ? `<img src="${backImage}" alt="Back of ID" />`
                  : `<div class="id-card-placeholder">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM4 17V7h16v10H4z"/>
                        <path d="M6 9h12v2H6zm0 3h8v2H6z"/>
                      </svg>
                      <p style="margin-top:8px;">Back Side - Emergency Contact Info</p>
                    </div>`
                }
              </div>
            </div>
          </div>
          <div class="info">
            <strong>Name:</strong> ${qrtId.fullName} |
            <strong>QRT Code:</strong> ${qrtId.qrtCode} |
            <strong>Issued:</strong> ${qrtId.issuedDate ? new Date(qrtId.issuedDate).toLocaleDateString() : 'N/A'}
          </div>
          <button class="print-btn" onclick="window.print()">Print ID Card</button>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleDownload = async () => {
    if (!qrtId) return
    setIsDownloading(true)

    try {
      const { downloadImage } = await import("@/lib/qrt-id-generator")

      // Download front if available
      if (qrtId.idFrontImageUrl) {
        downloadImage(qrtId.idFrontImageUrl, `${qrtId.qrtCode}-front.png`)
      }

      // Small delay then download back
      await new Promise(resolve => setTimeout(resolve, 500))

      if (qrtId.idBackImageUrl) {
        downloadImage(qrtId.idBackImageUrl, `${qrtId.qrtCode}-back.png`)
      }

      if (!qrtId.idFrontImageUrl && !qrtId.idBackImageUrl) {
        alert("ID card images are not yet generated. Please try again later.")
      }
    } catch (err) {
      console.error("Download failed:", err)
      alert("Failed to download. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
      </div>
    )
  }

  if (!qrtId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
        <p className="mb-4 text-gray-500">QRT ID not found</p>
        <Button onClick={() => router.push("/qrt-id")} variant="outline">
          Back to List
        </Button>
      </div>
    )
  }

  // Only render QR code and related UI after baseUrl is available to prevent SSR/CSR divergence
  if (!baseUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
      </div>
    )
  }

  const verifyUrl = `${baseUrl}/verify/qrt/${qrtId.qrtCode}`
  const qrData = JSON.stringify({
    qrtCode: qrtId.qrtCode,
    fullName: qrtId.fullName,
    birthDate: qrtId.birthDate,
    issueDate: qrtId.issuedDate || new Date().toISOString().split('T')[0],
    verifyUrl
  })

  // Calculate timeline status
  const isPending = qrtId.status === "pending"
  const isProcessing = qrtId.status === "processing"
  const isReady = ["ready", "issued"].includes(qrtId.status)

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-5 shadow-sm">
        <Link href="/qrt-id" className="rounded-lg p-1 transition-colors hover:bg-[#F9FAFB]">
          <ArrowLeft className="h-5 w-5 text-[#374151]" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/images/logo.png" alt="Barangay Seal" fill className="object-contain" />
          </div>
          <h1 className="text-lg font-semibold text-[#111827]">QRT ID Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-4 px-5 pb-32 pt-5">
        
        {/* QRT Code Display Section */}
        <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4">
              <QRCodeSVG value={qrData} size={120} level="M" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{qrtId.qrtCode || "PENDING"}</h2>
            <div className="mt-2 flex items-center gap-2">
              <QRTStatusBadge status={qrtId.status} />
            </div>
            <p className="mt-4 text-xs text-gray-500">Scan to verify identity</p>
          </CardContent>
        </Card>

        {/* ID Card Images Section */}
        <IDCardPreview 
          frontImageUrl={qrtId.idFrontImageUrl} 
          backImageUrl={qrtId.idBackImageUrl} 
          qrtCode={qrtId.qrtCode} 
          fullName={qrtId.fullName} 
          onDownload={handleDownload} 
          isReady={isReady} 
        />

        {/* Personal Information Section */}
        <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-[#111827]">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs">Full Name</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.fullName}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Birth Date</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.birthDate}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <span className="text-xs">Age</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.age} years old</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <span className="text-xs">Gender</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.gender}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <span className="text-xs">Civil Status</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.civilStatus}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Ruler className="h-4 w-4" />
                  <span className="text-xs">Height</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.height || "-"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Weight className="h-4 w-4" />
                  <span className="text-xs">Weight</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.weight || "-"}</p>
              </div>

              <div className="col-span-2">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">Address</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Section */}
        <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-[#111827]">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs">Contact Person</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.emergencyContactName}</p>
                <p className="text-xs text-gray-500">Relationship: {qrtId.emergencyContactRelationship}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-xs">Phone Number</span>
                </div>
                <a href={`tel:${qrtId.emergencyContactPhone}`} className="font-medium text-emerald-600 hover:underline">
                  {qrtId.emergencyContactPhone}
                </a>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">Address</span>
                </div>
                <p className="font-medium text-[#111827]">{qrtId.emergencyContactAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline Section */}
        <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-[#111827]">Status Timeline</h3>
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {/* Request Submitted */}
              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-[#111827]">Request Submitted</p>
                <p className="text-xs text-gray-500">
                  {new Date(qrtId.requestDate || qrtId.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Payment Confirmed - assuming payment is handled/confirmed if processing */}
              <div className="relative pl-6">
                <div className={cn(
                  "absolute -left-1.5 top-0 h-3 w-3 rounded-full",
                  isProcessing || isReady ? "bg-emerald-500" : "bg-gray-200"
                )} />
                <p className={cn(
                  "text-sm font-medium",
                  isProcessing || isReady ? "text-[#111827]" : "text-gray-400"
                )}>Payment Confirmed</p>
              </div>

              {/* ID Generation */}
              <div className="relative pl-6">
                <div className={cn(
                  "absolute -left-1.5 top-0 h-3 w-3 rounded-full",
                  isReady ? "bg-emerald-500" : "bg-gray-200"
                )} />
                <p className={cn(
                  "text-sm font-medium",
                  isReady ? "text-[#111827]" : "text-gray-400"
                )}>ID Generated</p>
              </div>

              {/* ID Ready */}
              <div className="relative pl-6">
                <div className={cn(
                  "absolute -left-1.5 top-0 h-3 w-3 rounded-full",
                  isReady ? "bg-emerald-500" : "bg-gray-200"
                )} />
                <p className={cn(
                  "text-sm font-medium",
                  isReady ? "text-[#111827]" : "text-gray-400"
                )}>Ready for Download</p>
                {isReady && qrtId.issuedDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(qrtId.issuedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white px-5 py-4">
        <div className="mx-auto max-w-md space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={!isReady}
              className="h-[52px] flex-1 rounded-xl border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] bg-transparent"
            >
              {isCopied ? <Check className="mr-2 h-5 w-5 text-emerald-600" /> : <Share2 className="mr-2 h-5 w-5" />}
              {isCopied ? "Copied!" : "Share QRT"}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!isReady}
              className="h-[52px] flex-1 rounded-xl border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] bg-transparent"
            >
              <Printer className="mr-2 h-5 w-5" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
