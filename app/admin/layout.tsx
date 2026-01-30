"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// Change 1: Added 'MessageSquare' to the imports below
import { LayoutDashboard, Users, FileText, AlertTriangle, Home, Menu, X, MessageSquare, LogOut, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { isAdminAuthenticated, clearAdminSession } from "@/lib/auth"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Agreement Document", icon: Users },
  { href: "/admin/agreements", label: "Ongoing", icon: FileText },
  { href: "/admin/requests", label: "Requests", icon: MessageSquare },
  { href: "/admin/expiring", label: "Renewals", icon: AlertTriangle },
  { href: "/admin/agents", label: "Agents", icon: Briefcase },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check authentication on mount, but skip for login page
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsChecking(false)
      return
    }

    const checkAuth = () => {
      if (isAdminAuthenticated()) {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/login")
      }
      setIsChecking(false)
    }
    checkAuth()
  }, [router, pathname])

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  // If on login page, render children without layout
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show loading state while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="font-semibold">RentSecure</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2 p-6 border-b border-border">
              <FileText className="h-6 w-6" />
              <span className="text-lg font-semibold">RentSecure</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Back to Home & Logout */}
            <div className="p-4 border-t border-border space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Home className="h-5 w-5" />
                Back to Website
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden
      bg-black/70
      backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}


        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh)]">{children}</main>
      </div>
    </div>
  )
}