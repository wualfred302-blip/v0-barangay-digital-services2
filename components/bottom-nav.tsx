"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, User, Megaphone, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/requests", icon: ClipboardList, label: "Requests" },
  { href: "/payment/history", icon: Wallet, label: "Payments" },
  { href: "/announcements", icon: Megaphone, label: "News" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-[72px] max-w-md items-center justify-around px-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
              <item.icon
                className={cn("h-6 w-6 transition-colors", isActive ? "text-[#10B981]" : "text-[#9CA3AF]")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn("text-xs font-medium transition-colors", isActive ? "text-[#10B981]" : "text-[#9CA3AF]")}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
