"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { useOrganization } from "@/lib/org-context"
import { Plus, Users, Mail, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface Invitation {
  id: string
  email: string
  role: string
  status: "pending" | "accepted" | "rejected" | "canceled"
  organizationId: string
  organizationName?: string
  createdAt: string | Date
}

export default function ChooseActionPage() {
  const router = useRouter()
  const { setActiveOrgId, setActiveOrgName } = useOrganization()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    checkExistingOrganizations()
  }, [])

  const checkExistingOrganizations = async () => {
    try {
      // Check if user already has organizations
      const orgs = await apiClient.listOrganizations()
      if (orgs && orgs.length > 0) {
        // User already belongs to an organization, redirect to dashboard
        setActiveOrgId(orgs[0].id)
        setActiveOrgName(orgs[0].name)
        router.push("/dashboard")
        return
      }

      // Fetch pending invitations
      const userInvitations = await apiClient.listUserInvitations()
      const pendingInvitations = Array.isArray(userInvitations) 
        ? userInvitations.filter(inv => inv.status === "pending")
        : []
      setInvitations(pendingInvitations)
    } catch (error) {
      console.error("Failed to check organizations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    setAcceptingId(invitationId)
    try {
      await apiClient.acceptInvitation(invitationId)
      toast.success("Invitation accepted! Redirecting to dashboard...")
      
      // Refresh organizations and redirect
      const orgs = await apiClient.listOrganizations()
      if (orgs && orgs.length > 0) {
        setActiveOrgId(orgs[0].id)
        setActiveOrgName(orgs[0].name)
      }
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Failed to accept invitation:", error)
      toast.error(error.message || "Failed to accept invitation")
      setAcceptingId(null)
    }
  }

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await apiClient.rejectInvitation(invitationId)
      toast.success("Invitation rejected")
      setInvitations(invitations.filter(inv => inv.id !== invitationId))
    } catch (error: any) {
      console.error("Failed to reject invitation:", error)
      toast.error(error.message || "Failed to reject invitation")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome! Let's Get Started</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Choose how you'd like to proceed
          </p>
        </div>

        {invitations.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Pending Invitations
                </div>
                <span className="sm:ml-auto inline-flex w-fit items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  {invitations.length}
                </span>
              </CardTitle>
              <CardDescription className="text-sm">
                You've been invited to join {invitations.length} {invitations.length === 1 ? "organization" : "organizations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {invitation.organizationName || invitation.organizationId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Role: <span className="font-medium">{invitation.role}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={acceptingId === invitation.id}
                    >
                      {acceptingId === invitation.id ? "Accepting..." : "Accept"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleRejectInvitation(invitation.id)}
                      disabled={acceptingId !== null}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className={invitations.length > 0 ? "grid sm:grid-cols-2 gap-4" : "flex justify-center"}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-2">
                <Plus className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Create New Organization</CardTitle>
              <CardDescription className="text-sm">
                Start fresh with your own organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                className="w-full group-hover:bg-primary/90"
              >
                <Link href="/create-organization">
                  Create Organization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {invitations.length > 0 && (
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Join Existing Organization</CardTitle>
                <CardDescription className="text-sm">
                  You have pending invitations to accept
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  asChild 
                  variant="outline"
                  className="w-full group-hover:border-primary"
                >
                  <Link href="#invitations">
                    View Invitations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          Already have an organization?{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
