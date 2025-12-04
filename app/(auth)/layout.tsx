import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex min-h-screen items-center justify-center bg-background">{children}</div>
}
