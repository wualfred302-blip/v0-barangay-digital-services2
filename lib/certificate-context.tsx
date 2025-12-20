"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, memo, useCallback, useMemo } from "react"
import { usePayment } from "./payment-context"

export interface CertificateRequest {
  id: string
  certificateType: string
  purpose: string
  customPurpose?: string
  requestType: "regular" | "rush"
  amount: number
  paymentReference: string
  paymentTransactionId?: string
  serialNumber: string
  status: "processing" | "ready"
  createdAt: string
  readyAt?: string
  age: number
  purok: string
  yearsOfResidency: number
  residentName?: string
  staffSignature?: string
  signedBy?: string
  signedByRole?: string
  signedAt?: string
}

interface CertificateContextType {
  certificates: CertificateRequest[]
  currentRequest: Partial<CertificateRequest> | null
  setCurrentRequest: (request: Partial<CertificateRequest> | null) => void
  addCertificate: (cert: CertificateRequest) => void
  updateCertificateStatus: (
    id: string,
    status: "processing" | "ready",
    signatureData?: {
      signature: string
      signedBy: string
      signedByRole: string
    },
  ) => void
  getCertificate: (id: string) => CertificateRequest | undefined
  getVerificationUrl: (serialNumber: string) => string
  getCertificatesByPaymentStatus: (status: "pending" | "success" | "failed") => CertificateRequest[]
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined)

export const CertificateProvider = memo(({ children }: { children: ReactNode }) => {
  const [certificates, setCertificates] = useState<CertificateRequest[]>([])
  const [currentRequest, setCurrentRequest] = useState<Partial<CertificateRequest> | null>(null)
  const { payments } = usePayment()

  // Async load from localStorage
  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("barangay_certificates")
        if (stored) {
          setCertificates(JSON.parse(stored))
        }
      } catch (e) {
        console.error("Failed to parse stored certificates:", e)
        localStorage.removeItem("barangay_certificates")
      }
    }
    load()
  }, [])

  // Debounced save to localStorage
  useEffect(() => {
    if (certificates.length === 0) return
    const timeout = setTimeout(() => {
      localStorage.setItem("barangay_certificates", JSON.stringify(certificates, null, 0))
    }, 1000)
    return () => clearTimeout(timeout)
  }, [certificates])

  const addCertificate = useCallback((cert: CertificateRequest) => {
    setCertificates(prev => [...prev, cert])
  }, [])

  const updateCertificateStatus = useCallback((
    id: string,
    status: "processing" | "ready",
    signatureData?: {
      signature: string
      signedBy: string
      signedByRole: string
    },
  ) => {
    setCertificates(prev => prev.map((cert) =>
      cert.id === id
        ? {
            ...cert,
            status,
            readyAt: status === "ready" ? new Date().toISOString() : undefined,
            ...(signatureData && {
              staffSignature: signatureData.signature,
              signedBy: signatureData.signedBy,
              signedByRole: signatureData.signedByRole,
              signedAt: new Date().toISOString(),
            }),
          }
        : cert,
    ))
  }, [])

  const getCertificate = useCallback((id: string) => {
    return certificates.find((cert) => cert.id === id)
  }, [certificates])

  const getVerificationUrl = useCallback((serialNumber: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mawaque.gov.ph"
    return `${baseUrl}/verify/${serialNumber}`
  }, [])

  const getCertificatesByPaymentStatus = useCallback((status: "pending" | "success" | "failed") => {
    return certificates.filter((cert) => {
      if (!cert.paymentTransactionId) return false
      const payment = payments.find((p) => p.id === cert.paymentTransactionId)
      return payment?.status === status
    })
  }, [certificates, payments])

  const value = useMemo(() => ({
    certificates,
    currentRequest,
    setCurrentRequest,
    addCertificate,
    updateCertificateStatus,
    getCertificate,
    getVerificationUrl,
    getCertificatesByPaymentStatus,
  }), [
    certificates,
    currentRequest,
    addCertificate,
    updateCertificateStatus,
    getCertificate,
    getVerificationUrl,
    getCertificatesByPaymentStatus
  ])

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  )
})

export function useCertificates() {
  const context = useContext(CertificateContext)
  if (context === undefined) {
    throw new Error("useCertificates must be used within a CertificateProvider")
  }
  return context
}
