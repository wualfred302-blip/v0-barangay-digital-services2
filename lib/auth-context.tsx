"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "resident" | "captain" | "secretary" | "treasurer"

interface User {
  id?: string
  fullName: string
  mobileNumber: string
  email: string
  address: string
  role?: UserRole
}

interface StaffUser {
  id: string
  fullName: string
  email: string
  role: "captain" | "secretary" | "treasurer"
}

interface AuthContextType {
  user: User | null
  staffUser: StaffUser | null
  isAuthenticated: boolean
  isStaffAuthenticated: boolean
  isLoading: boolean
  userRole: UserRole | null
  login: (userData: User) => void
  staffLogin: (staffData: StaffUser) => void
  logout: () => void
  staffLogout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load resident auth
    const storedUser = localStorage.getItem("barangay_user")
    const storedAuth = localStorage.getItem("barangay_auth")

    if (storedUser && storedAuth === "true") {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }

    // Load staff auth
    const storedStaff = localStorage.getItem("barangay_staff")
    const storedStaffAuth = localStorage.getItem("barangay_staff_auth")

    if (storedStaff && storedStaffAuth === "true") {
      setStaffUser(JSON.parse(storedStaff))
      setIsStaffAuthenticated(true)
    }

    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    const userWithRole = { ...userData, role: "resident" as UserRole }
    setUser(userWithRole)
    setIsAuthenticated(true)
    localStorage.setItem("barangay_user", JSON.stringify(userWithRole))
    localStorage.setItem("barangay_auth", "true")
  }

  const staffLogin = (staffData: StaffUser) => {
    setStaffUser(staffData)
    setIsStaffAuthenticated(true)
    localStorage.setItem("barangay_staff", JSON.stringify(staffData))
    localStorage.setItem("barangay_staff_auth", "true")
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("barangay_user")
    localStorage.removeItem("barangay_auth")
  }

  const staffLogout = () => {
    setStaffUser(null)
    setIsStaffAuthenticated(false)
    localStorage.removeItem("barangay_staff")
    localStorage.removeItem("barangay_staff_auth")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("barangay_user", JSON.stringify(updatedUser))
    }
  }

  const userRole: UserRole | null = staffUser?.role || user?.role || null

  return (
    <AuthContext.Provider
      value={{
        user,
        staffUser,
        isAuthenticated,
        isStaffAuthenticated,
        isLoading,
        userRole,
        login,
        staffLogin,
        logout,
        staffLogout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
