"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Shield, Loader2 } from "lucide-react"

// Demo staff accounts
const DEMO_STAFF = [
  { id: "1", fullName: "Hon. Roberto Santos", email: "captain@mawaque.gov.ph", role: "captain" as const },
  { id: "2", fullName: "Maria Cruz", email: "secretary@mawaque.gov.ph", role: "secretary" as const },
  { id: "3", fullName: "Juan Dela Cruz", email: "treasurer@mawaque.gov.ph", role: "treasurer" as const },
]

export default function StaffLoginPage() {
  const router = useRouter()
  const { staffLogin } = useAuth()
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Demo mode: accept any PIN for demo accounts
    const staff = DEMO_STAFF.find((s) => s.email.toLowerCase() === email.toLowerCase())

    if (staff) {
      staffLogin(staff)
      // Route based on role
      router.push(`/staff/${staff.role}`)
    } else {
      setError("Invalid credentials. Use a demo account.")
    }

    setIsLoading(false)
  }

  const handleQuickLogin = (staff: (typeof DEMO_STAFF)[0]) => {
    setEmail(staff.email)
    setPin("123456")
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-4 h-20 w-20">
            <Image
              src="/images/mawaque-20logo.jpeg"
              alt="Barangay Mawaque Seal"
              fill
              className="rounded-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Staff Portal</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">Barangay Mawaque</h1>
          <p className="mt-1 text-sm text-slate-400">Official Staff Login</p>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-sm border-0 bg-white/10 backdrop-blur-lg">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@mawaque.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium text-white/90">
                  PIN Code
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {error && <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="h-12 w-full bg-amber-500 font-semibold text-slate-900 hover:bg-amber-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-white/50">
                Demo Accounts
              </p>
              <div className="space-y-2">
                {DEMO_STAFF.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleQuickLogin(staff)}
                    className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{staff.fullName}</p>
                      <p className="text-xs text-white/50">{staff.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                        staff.role === "captain"
                          ? "bg-amber-500/20 text-amber-400"
                          : staff.role === "secretary"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {staff.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
