"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function AcceptInvitePage() {
  const router = useRouter()
  const { token } = useParams()
  const [invitation, setInvitation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      const data = await apiClient.getInvitation(token as string)
      setInvitation(data)
    } catch (error: any) {
      console.error("Failed to fetch invitation:", error)
      setError(error.response?.data?.message || "Invalid or expired invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    setIsProcessing(true)
    setError("")
    try {
      await apiClient.acceptInvitation(token as string)
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Failed to accept invitation:", error)
      setError(error.response?.data?.message || "Failed to accept invitation")
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    setError("")
    try {
      await apiClient.rejectInvitation(token as string)
      setTimeout(() => {
        router.push("/sign-in")
      }, 1500)
    } catch (error: any) {
      console.error("Failed to reject invitation:", error)
      setError(error.response?.data?.message || "Failed to reject invitation")
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Invitation Accepted!</h2>
              <p className="text-muted-foreground text-center">
                Redirecting you to the dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-2xl font-bold">Invalid Invitation</h2>
              <p className="text-muted-foreground text-center">{error}</p>
              <Button onClick={() => router.push("/sign-in")} className="mt-4">
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation && (
            <div className="rounded-lg border p-4 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{invitation.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{invitation.role}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
