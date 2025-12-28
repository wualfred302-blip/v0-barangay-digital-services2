"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, ShieldCheck, Loader2 } from "lucide-react"
import { useCertificates, type CertificateRequest } from "@/lib/certificate-context"
import { useQRT } from "@/lib/qrt-context"
import { usePayment } from "@/lib/payment-context"
import { processPayment, validatePaymentMethod, PaymentTransaction } from "@/lib/payment-utils"
import { GCashForm, MayaForm, BankTransferForm } from "@/components/payment-methods"
import { PaymentReceiptModal } from "@/components/payment-receipt-modal"
import QRCode from "qrcode"
import { QRTIDFrontTemplate } from "@/components/qrt-id-front-template"
import { QRTIDBackTemplate } from "@/components/qrt-id-back-template"
import { generateQRTIDImages } from "@/lib/qrt-id-generator"

// Wrapper component to handle Suspense for useSearchParams
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentRequest, addCertificate, setCurrentRequest } = useCertificates()
  const { currentRequest: qrtRequest, setCurrentRequest: setQrtRequest, addQRTRequest, isLoaded: qrtContextLoaded } = useQRT()
  const { addPayment } = usePayment()

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("Connecting to payment provider...")
  const [lastTransaction, setLastTransaction] = useState<PaymentTransaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if payment was completed to prevent redirect after clearing contexts
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // Get payment type from URL parameter - this is the source of truth for the flow type
  const paymentType = searchParams.get("type") // "qrt" or "certificate" or null

  // State for computed template data (needed for image generation)
  const [templateData, setTemplateData] = useState<{
    qrtCode: string
    qrCodeDataUrl: string
    issuedDate: string
    expiryDate: string
  } | null>(null)

  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  // Wait for QRT context to load before checking if we should redirect
  // IMPORTANT: Don't redirect if payment was completed (contexts are intentionally cleared)
  // IMPORTANT: Use URL parameter to determine correct redirect target
  useEffect(() => {
    if (paymentCompleted || showReceipt) {
      // Don't redirect after payment is complete
      return
    }

    if (qrtContextLoaded && !currentRequest && !qrtRequest) {
      // Redirect to the appropriate page based on payment type URL parameter
      if (paymentType === "qrt") {
        router.push("/qrt-id/request")
      } else {
        router.push("/request")
      }
    }
  }, [qrtContextLoaded, currentRequest, qrtRequest, router, paymentCompleted, showReceipt, paymentType])

  // Show loading spinner while QRT context is loading from localStorage
  if (!qrtContextLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </div>
    )
  }

  // Don't render null if payment was completed - show receipt instead
  if (!currentRequest && !qrtRequest && !paymentCompleted && !showReceipt) return null

  // Determine payment type - use URL parameter as primary source, fallback to context
  const isQRTPayment = paymentType === "qrt" || !!qrtRequest

  // Calculate total with processing fee
  // Use optional chaining since contexts may be null after payment completion
  const fee = isQRTPayment ? (qrtRequest?.amount || 100) : (currentRequest?.amount || 50)
  const certFee = fee
  const processingFee = 5
  const totalAmount = certFee + processingFee

  // Determine back URL based on payment type
  const backUrl = isQRTPayment ? "/qrt-id/request" : "/request"

  const handlePaymentSubmit = async (method: "gcash" | "maya" | "bank_transfer", formData: any) => {
    setError(null)

    // Validate
    const validation = validatePaymentMethod(method, formData)
    if (!validation.isValid) {
      setError(validation.error || "Invalid payment details")
      return
    }

    setIsProcessing(true)

    // Simulated steps
    const messages = isQRTPayment
      ? ["Connecting to payment provider...", "Verifying account...", "Processing payment...", "Generating QRT ID..."]
      : ["Connecting to payment provider...", "Verifying account...", "Processing payment..."]
    let msgIndex = 0
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setProcessingMessage(messages[msgIndex])
    }, 800)

    try {
      const requestId = isQRTPayment ? (qrtRequest.id || `temp-${Date.now()}`) : (currentRequest?.id || `temp-${Date.now()}`)
      const transaction = await processPayment(method, totalAmount, requestId)

      clearInterval(interval)

      // Save payment
      addPayment(transaction)
      setLastTransaction(transaction)

      if (isQRTPayment) {
        // QRT ID GENERATION FLOW
        setProcessingMessage("Generating QRT ID...")

        // 1. Generate QRT Code
        const year = new Date().getFullYear()
        const sequentialNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, "0")
        const qrtCode = `QRT-${year}-${sequentialNumber}`

        // 2. Generate QR Code Data URL
        const qrData = {
          qrtCode,
          fullName: qrtRequest.fullName,
          birthDate: qrtRequest.birthDate,
          issuedDate: new Date().toISOString(),
        }
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData))

        // 3. Calculate Dates (format for display)
        const now = new Date()
        const issuedDate = now.toISOString()
        const issuedDateFormatted = now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        const expiryDateObj = new Date()
        expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1)
        const expiryDateISO = expiryDateObj.toISOString()
        const expiryDateFormatted = expiryDateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })

        // 4. Set template data and wait for re-render before capturing images
        setTemplateData({
          qrtCode,
          qrCodeDataUrl,
          issuedDate: issuedDateFormatted,
          expiryDate: expiryDateFormatted,
        })

        // 5. Generate ID Card Images
        // Wait for React to fully re-render and for images to load
        let frontImageUrl = ""
        let backImageUrl = ""

        console.log("[QRT ID Generation] Starting image generation...")
        console.log("[QRT ID Generation] Photo URL:", qrtRequest?.photoUrl ? "Present" : "MISSING")
        console.log("[QRT ID Generation] QR Code:", qrCodeDataUrl ? "Generated" : "MISSING")
        console.log("[QRT ID Generation] Front Ref:", frontRef.current ? "Ready" : "NOT FOUND")
        console.log("[QRT ID Generation] Back Ref:", backRef.current ? "Ready" : "NOT FOUND")

        try {
          // Helper function to wait for an image to load
          const waitForImageLoad = (imgSrc: string): Promise<void> => {
            return new Promise((resolve) => {
              if (!imgSrc) {
                console.log("[QRT ID Generation] No image to load")
                resolve()
                return
              }
              const img = new window.Image()
              img.onload = () => {
                console.log("[QRT ID Generation] Image loaded successfully")
                resolve()
              }
              img.onerror = (err) => {
                console.error("[QRT ID Generation] Image load failed:", err)
                resolve() // Continue even if image fails
              }
              img.src = imgSrc
              // Timeout after 3 seconds
              setTimeout(() => {
                console.log("[QRT ID Generation] Image load timeout (3s)")
                resolve()
              }, 3000)
            })
          }

          // Pre-load the photo and QR code to ensure they're in browser cache
          const preloadPromises: Promise<void>[] = []
          if (qrtRequest?.photoUrl) {
            console.log("[QRT ID Generation] Preloading user photo...")
            preloadPromises.push(waitForImageLoad(qrtRequest.photoUrl))
          }
          if (qrCodeDataUrl) {
            console.log("[QRT ID Generation] Preloading QR code...")
            preloadPromises.push(waitForImageLoad(qrCodeDataUrl))
          }
          await Promise.all(preloadPromises)

          console.log("[QRT ID Generation] Images preloaded, waiting for DOM render...")

          // Wait for React to re-render the templates with new data
          // Use multiple animation frames to ensure DOM is painted
          await new Promise((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(resolve, 1000) // Increased to 1 second for more reliable rendering
              })
            })
          })

          console.log("[QRT ID Generation] DOM rendered, checking refs...")

          // Verify refs exist
          if (!frontRef.current || !backRef.current) {
            console.error("[QRT ID Generation] FAILED: Refs not available", {
              frontRef: !!frontRef.current,
              backRef: !!backRef.current
            })
            throw new Error("Templates not ready - refs missing")
          }

          console.log("[QRT ID Generation] Refs ready, waiting for images to load in DOM...")

          // Wait for all images in the templates to fully load
          const waitForDOMImages = async (ref: React.RefObject<HTMLDivElement>) => {
            if (!ref.current) return

            const images = ref.current.querySelectorAll('img')
            console.log(`[QRT ID Generation] Found ${images.length} images in template`)

            await Promise.all(Array.from(images).map((img, index) => {
              if (img.complete) {
                console.log(`[QRT ID Generation] Image ${index} already loaded`)
                return Promise.resolve()
              }
              return new Promise<void>(resolve => {
                img.onload = () => {
                  console.log(`[QRT ID Generation] Image ${index} loaded successfully`)
                  resolve()
                }
                img.onerror = (err) => {
                  console.warn(`[QRT ID Generation] Image ${index} failed to load:`, err)
                  resolve() // Continue even if image fails
                }
                // Timeout fallback - don't wait forever
                setTimeout(() => {
                  console.warn(`[QRT ID Generation] Image ${index} load timeout (3s)`)
                  resolve()
                }, 3000)
              })
            }))
          }

          await waitForDOMImages(frontRef)
          await waitForDOMImages(backRef)

          console.log("[QRT ID Generation] All images loaded, calling generateQRTIDImages...")

          // Verify photo is present if provided
          const frontImg = frontRef.current.querySelector('img')
          if (qrtRequest?.photoUrl && frontImg && !frontImg.complete) {
            console.warn("[QRT ID Generation] Photo not fully loaded, proceeding anyway...")
          }

          const result = await generateQRTIDImages(frontRef.current, backRef.current)
          console.log("[QRT ID Generation] Generation result:", result)

          if (result.success) {
            frontImageUrl = result.frontImageUrl || ""
            backImageUrl = result.backImageUrl || ""
            console.log("[QRT ID Generation] SUCCESS - Front image:", frontImageUrl ? `${frontImageUrl.substring(0, 50)}...` : "EMPTY")
            console.log("[QRT ID Generation] SUCCESS - Back image:", backImageUrl ? `${backImageUrl.substring(0, 50)}...` : "EMPTY")
          } else {
            console.error("[QRT ID Generation] FAILED:", result.error)
          }
        } catch (imgError) {
          console.error("[QRT ID Generation] EXCEPTION:", imgError)
          // Continue without images - they can be generated later
        }

        // 6. Create Complete QRT Record
        const qrtId = `qrt_${Date.now()}`
        const newQRTRecord = {
          id: qrtId,
          qrtCode,
          userId: qrtRequest.userId || "",
          fullName: qrtRequest.fullName || "",
          birthDate: qrtRequest.birthDate || "",
          age: qrtRequest.age || 0,
          gender: qrtRequest.gender || "",
          civilStatus: qrtRequest.civilStatus || "",
          birthPlace: qrtRequest.birthPlace || "",
          address: qrtRequest.address || "",
          height: qrtRequest.height || "",
          weight: qrtRequest.weight || "",
          yearsResident: qrtRequest.yearsResident || 0,
          citizenship: qrtRequest.citizenship || "",
          emergencyContactName: qrtRequest.emergencyContactName || "",
          emergencyContactAddress: qrtRequest.emergencyContactAddress || "",
          emergencyContactPhone: qrtRequest.emergencyContactPhone || "",
          emergencyContactRelationship: qrtRequest.emergencyContactRelationship || "",
          photoUrl: qrtRequest.photoUrl || "",
          qrCodeData: qrCodeDataUrl,
          idFrontImageUrl: frontImageUrl,
          idBackImageUrl: backImageUrl,
          status: "ready" as const,
          issuedDate,
          expiryDate: expiryDateISO,
          createdAt: qrtRequest.createdAt || new Date().toISOString(),
          paymentReference: transaction.transactionReference,
          paymentTransactionId: transaction.id,
          requestType: qrtRequest.requestType || "regular",
          amount: qrtRequest.amount || 100,
        }

        // 7. Save to Context
        addQRTRequest(newQRTRecord)

        // IMPORTANT: Set paymentCompleted BEFORE clearing context to prevent redirect
        setPaymentCompleted(true)
        setQrtRequest(null)
        setTemplateData(null)

        setIsProcessing(false)
        setShowReceipt(true)

      } else {
        // CERTIFICATE GENERATION FLOW (existing)
        const serial = `BGRY-MWQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(6, "0")}`
        const certId = `cert_${Date.now()}`

        const newCertificate: CertificateRequest = {
          id: certId,
          certificateType: currentRequest?.certificateType || "Barangay Clearance",
          purpose: currentRequest?.purpose || "Employment",
          customPurpose: currentRequest?.customPurpose,
          requestType: currentRequest?.requestType || "regular",
          amount: totalAmount,
          paymentReference: transaction.transactionReference,
          paymentTransactionId: transaction.id,
          serialNumber: serial,
          status: "processing",
          createdAt: new Date().toISOString(),
          age: currentRequest?.age || 0,
          residentName: currentRequest?.residentName,
          purok: currentRequest?.purok || "",
          yearsOfResidency: currentRequest?.yearsOfResidency || 0,
        }

        addCertificate(newCertificate)

        // IMPORTANT: Set paymentCompleted BEFORE clearing context to prevent redirect
        setPaymentCompleted(true)
        setIsProcessing(false)
        setShowReceipt(true)
      }

    } catch (err) {
      clearInterval(interval)
      setIsProcessing(false)
      setError("Payment failed. Please try again.")
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    if (isQRTPayment) {
      setQrtRequest(null)
      setCurrentRequest(null)
      router.push("/qrt-id")
    } else {
      setCurrentRequest(null)
      setQrtRequest(null)
      router.push("/requests")
    }
  }

  const handleViewCertificate = () => {
    setShowReceipt(false)
    if (isQRTPayment) {
      setQrtRequest(null)
      setCurrentRequest(null)
      router.push("/qrt-id")
    } else {
      setCurrentRequest(null)
      setQrtRequest(null)
      router.push("/requests")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <PaymentReceiptModal 
        transaction={lastTransaction}
        open={showReceipt}
        onClose={handleCloseReceipt}
        onViewCertificate={handleViewCertificate}
      />

      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-5">
        <Link href={backUrl} className="rounded-lg p-1 transition-colors hover:bg-[#F9FAFB]">
          <ArrowLeft className="h-5 w-5 text-[#374151]" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/images/logo.png" alt="Barangay Seal" fill className="object-contain" />
          </div>
          <h1 className="text-lg font-semibold text-[#111827]">Payment</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-5 pb-10">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#10B981]" />
              <p className="font-medium text-gray-900">{processingMessage}</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <Card className="mb-6 rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
               <div className="flex gap-3">
                 <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#10B981]">
                   <FileText className="h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900">
                     {isQRTPayment ? "QRT ID Request" : currentRequest?.certificateType}
                   </h3>
                   <p className="text-sm text-gray-500">
                     {isQRTPayment
                       ? `${qrtRequest?.fullName || "QRT ID"} - ${qrtRequest?.requestType === "rush" ? "Rush Processing" : "Regular Processing"}`
                       : currentRequest?.purpose}
                   </p>
                 </div>
               </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">{isQRTPayment ? "QRT ID Fee" : "Certificate Fee"}</span>
                 <span className="text-gray-900">₱{certFee.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Processing Fee</span>
                 <span className="text-gray-900">₱{processingFee.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pt-2">
                 <span className="font-bold text-gray-900">Total Amount</span>
                 <span className="text-xl font-bold text-[#10B981]">₱{totalAmount.toFixed(2)}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">Select Payment Method</div>

        <Tabs defaultValue="gcash" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl h-12">
            <TabsTrigger value="gcash" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">GCash</TabsTrigger>
            <TabsTrigger value="maya" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Maya</TabsTrigger>
            <TabsTrigger value="bank" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bank</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gcash" className="mt-0">
            <GCashForm 
              isLoading={isProcessing} 
              onSubmit={(data) => handlePaymentSubmit("gcash", data)} 
            />
          </TabsContent>
          
          <TabsContent value="maya" className="mt-0">
            <MayaForm 
              isLoading={isProcessing} 
              onSubmit={(data) => handlePaymentSubmit("maya", data)} 
            />
          </TabsContent>
          
          <TabsContent value="bank" className="mt-0">
            <BankTransferForm 
              isLoading={isProcessing} 
              onSubmit={(data) => handlePaymentSubmit("bank_transfer", data)} 
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure 256-bit encrypted payment</span>
        </div>
      </main>

      {/* Hidden QRT ID Templates for Image Generation */}
      {/* CRITICAL FIX: Use visibility:hidden instead of opacity/z-index tricks */}
      {/* This keeps elements fully rendered with proper styles for html2canvas */}
      {/* Refs are now attached directly to template components (not wrapper divs) */}
      {isQRTPayment && qrtRequest && (
        <div style={{
          position: "fixed",
          left: "0",
          top: "0",
          opacity: "1",           // Full opacity so styles compute correctly
          visibility: "hidden",    // Hidden but fully rendered in layout
          pointerEvents: "none",
          zIndex: 0               // Normal stacking context
        }}>
          <QRTIDFrontTemplate
            ref={frontRef}
            qrtCode={templateData?.qrtCode || "TEMP-QRT-CODE"}
            fullName={qrtRequest.fullName || "Test User"}
            birthDate={qrtRequest.birthDate || "01/01/1990"}
            address={qrtRequest.address || "Test Address"}
            gender={qrtRequest.gender || "Male"}
            civilStatus={qrtRequest.civilStatus || "Single"}
            birthPlace={qrtRequest.birthPlace || "Manila"}
            photoUrl={qrtRequest.photoUrl || ""}
            issuedDate={templateData?.issuedDate || new Date().toLocaleDateString()}
          />
          <QRTIDBackTemplate
            ref={backRef}
            qrtCode={templateData?.qrtCode || "TEMP-QRT-CODE"}
            height={qrtRequest.height || "170cm"}
            weight={qrtRequest.weight || "70kg"}
            yearsResident={qrtRequest.yearsResident || 5}
            citizenship={qrtRequest.citizenship || "Filipino"}
            emergencyContactName={qrtRequest.emergencyContactName || "Emergency Contact"}
            emergencyContactAddress={qrtRequest.emergencyContactAddress || "Same Address"}
            emergencyContactPhone={qrtRequest.emergencyContactPhone || "09123456789"}
            emergencyContactRelationship={qrtRequest.emergencyContactRelationship || "Family"}
            qrCodeDataUrl={templateData?.qrCodeDataUrl || ""}
            issuedDate={templateData?.issuedDate || new Date().toLocaleDateString()}
            expiryDate={templateData?.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}
          />
        </div>
      )}
    </div>
  )
}
