"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useOrganization } from "@/lib/org-context"
import { signOut } from "@/lib/auth-client"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { toast } from "sonner"

export function Sidebar() {
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveOrgId } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      setActiveOrgId(null)
      toast.success("Signed out successfully")
      router.push("/sign-in")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to sign out")
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed left-4 top-4 z-50 md:hidden">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Organization Switcher at top */}
          <div className="p-4 border-b border-sidebar-border">
            <OrganizationSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-6">
              {/* Platform Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Platform
                </h3>
                <div className="space-y-1">
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 px-2" 
                      onClick={() => setIsOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      Table
                    </Button>
                  </Link>
                  <Link href="/dashboard/team">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 px-2" 
                      onClick={() => setIsOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Team Info / Setup
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start gap-3 px-2" onClick={handleLogout}>
              <LogOut size={20} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content shift */}
      <div className="md:pl-64" />
    </>
  )
}
