"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 md:pl-0">{children}</div>
    </div>
  )
}
