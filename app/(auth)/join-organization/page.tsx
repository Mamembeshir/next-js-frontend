"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export default function JoinOrganizationPage() {
  const router = useRouter()
  const [invitationId, setInvitationId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await apiClient.acceptInvitation(invitationId)
      toast.success("Successfully joined organization!")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join organization. Invalid or expired invitation.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join Organization</CardTitle>
        <CardDescription>Enter your invitation code to join an organization</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invitationId">Invitation Code</Label>
            <Input
              id="invitationId"
              type="text"
              placeholder="Enter invitation code"
              value={invitationId}
              onChange={(e) => setInvitationId(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
