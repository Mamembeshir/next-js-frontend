"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/sign-in")
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )
}
