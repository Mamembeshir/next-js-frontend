"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useOrganization } from "@/lib/org-context"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserX, Plus, Mail, X } from "lucide-react"
import { toast } from "sonner"

interface Member {
  userId: string
  email: string
  name: string
  role: "owner" | "member" | "admin"
}

interface Invitation {
  id: string
  email: string
  role: string
  status: "pending" | "accepted" | "rejected" | "canceled"
  organizationId: string
  organizationName?: string
  createdAt: string | Date
}

export default function TeamPage() {
  const { user } = useAuth()
  const { activeOrgId, activeOrgName } = useOrganization()
  
  // Get active organization from Better Auth
  const { data: activeOrganization } = authClient.useActiveOrganization()
  console.log("🎯 Better Auth activeOrganization:", activeOrganization)
  console.log("🎯 Context activeOrgId:", activeOrgId)
  console.log("🎯 Context activeOrgName:", activeOrgName)
  
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [userInvitations, setUserInvitations] = useState<Invitation[]>([])
  const [userRole, setUserRole] = useState<"owner" | "member" | "admin">("member")
  const [organizationName, setOrganizationName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  useEffect(() => {
    console.log("organizationName state changed to:", organizationName)
  }, [organizationName])

  useEffect(() => {
    console.log("userRole state changed to:", userRole)
  }, [userRole])

  useEffect(() => {
    if (activeOrgId) {
      fetchData()
    }
  }, [activeOrgId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // First, set the active organization in Better Auth
      if (activeOrgId) {
        console.log("fetchData - Setting active organization:", activeOrgId)
        console.log("fetchData - Active org name from context:", activeOrgName)
        const result = await apiClient.setActiveOrganization(activeOrgId)
        console.log("fetchData - setActiveOrganization returned:", result)
      } else {
        console.warn("fetchData - No activeOrgId available!")
      }
      // Then fetch all data
      await Promise.all([fetchMembers(), fetchMyRole(), fetchInvitations(), fetchOrgName(), fetchUserInvitations()])
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isAuthMember = (value: unknown): value is {
    userId?: string
    id?: string
    role?: Member["role"]
    email?: string
    name?: string
    user?: {
      email?: string
      name?: string
    }
  } => {
    if (!value || typeof value !== "object") return false
    const candidate = value as Record<string, unknown>
    return (
      typeof (candidate.userId ?? candidate.id) === "string" &&
      typeof candidate.role === "string"
    )
  }

  const fetchMembers = async () => {
    if (!activeOrgId) return
    try {
      console.log("fetchMembers - activeOrgId:", activeOrgId)
      await apiClient.setActiveOrganization(activeOrgId);
      const data = await apiClient.listMembers(activeOrgId)
      console.log("fetchMembers - data:", data)

      const rawMembers = Array.isArray(data)
        ? data
        : Array.isArray((data as unknown as { members?: unknown[] })?.members)
          ? (data as unknown as { members: unknown[] }).members
          : []

      const memberList = rawMembers.filter(isAuthMember).map((member) => ({
        userId: member.userId ?? member.id ?? "",
        email: member.email ?? member.user?.email ?? "",
        name: member.name ?? member.user?.name ?? member.user?.email ?? "Unknown Member",
        role: (member.role as Member["role"]) ?? "member",
      }))

      if (!memberList.length) {
        console.warn("fetchMembers - No members returned from API")
      }

      const uniqueMembers = Array.from(
        new Map(memberList.map((member) => [member.userId, member])).values()
      )
      console.log("fetchMembers - after deduplication:", uniqueMembers)
      setMembers(uniqueMembers)
      console.log('this is uniqueMembers', uniqueMembers)
    } catch (error) {
      console.error("Failed to fetch members:", error)
      toast.error("Failed to load team members")
    }
  }

  const fetchMyRole = async () => {
    try {
      const data = await apiClient.getActiveMemberRole()
      console.log("fetchMyRole - Role data received:", data)
      
      // Better Auth returns the role directly or in a nested structure
      if (data) {
        // Handle different possible response structures
        const role = data.role || data
        console.log("fetchMyRole - Extracted role:", role)
        setUserRole(role)
      }
    } catch (error) {
      console.error("fetchMyRole - Failed to fetch role:", error)
      // Set a default role to prevent UI issues
      setUserRole("member")
    }
  }

  const fetchOrgName = async () => {
    try {
      console.log("fetchOrgName - activeOrgName from context:", activeOrgName)
      
      // Better Auth's getActiveMember returns member data without nested organization
      // Use activeOrgName from context instead
      if (activeOrgName) {
        console.log("fetchOrgName - Setting org name from context:", activeOrgName)
        setOrganizationName(activeOrgName)
      }
    } catch (error) {
      console.error("fetchOrgName - Failed to fetch org name:", error)
      if (activeOrgName) {
        setOrganizationName(activeOrgName)
      }
    }
  }

  const fetchInvitations = async () => {
    if (!activeOrgId) return
    try {
      console.log("fetchInvitations - activeOrgId:", activeOrgId)
      const data = await apiClient.listInvitations(activeOrgId)
      console.log("fetchInvitations - data:", data)
      setInvitations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch invitations:", error)
    }
  }

  const fetchUserInvitations = async () => {
    try {
      const data = await apiClient.listUserInvitations()
      console.log("fetchUserInvitations - data:", data)
      setUserInvitations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch user invitations:", error)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrgId) return
    setIsInviting(true)

    try {
      // Ensure active org is set before action
      await apiClient.setActiveOrganization(activeOrgId)
      
      await apiClient.createInvitation(activeOrgId, inviteEmail)
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail("")
      setIsInviteDialogOpen(false)
      fetchInvitations()
    } catch (error: any) {
      console.error("Failed to invite member:", error)
      const errorMessage = error.message || error.body?.message || "Failed to send invitation"
      toast.error(errorMessage)
    } finally {
      setIsInviting(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      console.log("handleCancelInvitation - cancelling invitation:", invitationId)
      
      // Ensure active org is set before action
      if (activeOrgId) {
        await apiClient.setActiveOrganization(activeOrgId)
        
        // Verify role IMMEDIATELY before the operation
        const roleCheck = await apiClient.getActiveMemberRole()
        console.log("🔍 Role check RIGHT BEFORE cancelInvitation:", roleCheck)
        
        await apiClient.cancelInvitation(invitationId)
      }

      toast.success("Invitation canceled")
      fetchInvitations()
    } catch (error: any) {
      console.error("Failed to cancel invitation:", error)
      const errorMessage = error.message || error.body?.message || "Failed to cancel invitation"
      toast.error(errorMessage)
    }
  }

  const handleRemoveMember = async (email: string, userId: string) => {
    if (!activeOrgId) return
    try {
      console.log("handleRemoveMember - removing email:", email, "userId:", userId)
      
      // Ensure active org is set before action
      await apiClient.setActiveOrganization(activeOrgId)
      
      // Verify role IMMEDIATELY before the operation
      const roleCheck = await apiClient.getActiveMemberRole()
      console.log("🔍 Role check RIGHT BEFORE removeMember:", roleCheck)

      // Use email instead of userId as Better Auth expects memberIdOrEmail
      await apiClient.removeMember(email, activeOrgId)
      setMembers(members.filter((m) => m.userId !== userId))
      toast.success("Member removed successfully")
    } catch (error: any) {
      console.error("Failed to remove member:", error)
      // Better Auth errors might be directly in error.message or error.body.message
      const errorMessage = error.message || error.body?.message || "Failed to remove member"
      toast.error(errorMessage)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!activeOrgId) return
    try {
      // Ensure active org is set before action
      await apiClient.setActiveOrganization(activeOrgId)
      
      // await apiClient.updateMemberRole(memberId, newRole, activeOrgId)
      setMembers(members.map((m) => (m.userId === memberId ? { ...m, role: newRole as "owner" | "member" } : m)))
      toast.success("Member role updated")
    } catch (error: any) {
      console.error("Failed to update role:", error)
      toast.error(error.response?.data?.message || "Failed to update role")
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await apiClient.acceptInvitation(invitationId)
      toast.success("Invitation accepted")
      fetchUserInvitations()
      // Refresh other data as we might have joined a new org
      window.location.reload()
    } catch (error: any) {
      console.error("Failed to accept invitation:", error)
      toast.error(error.response?.data?.message || "Failed to accept invitation")
    }
  }

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await apiClient.rejectInvitation(invitationId)
      toast.success("Invitation rejected")
      fetchUserInvitations()
    } catch (error: any) {
      console.error("Failed to reject invitation:", error)
      toast.error(error.response?.data?.message || "Failed to reject invitation")
    }
  }

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending")

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading team...</div>
  }

  return (
    <main className="p-6 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Team Info / Setup</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your team members and organization</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Organization Name</Label>
                <p className="text-lg font-medium">{organizationName || "Your Organization"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                Sent Invitations (Pending)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Sent</TableHead>
                      {(userRole === "owner" || userRole === "admin") && <TableHead className="w-12"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-yellow-100 dark:bg-yellow-900 px-2.5 py-0.5 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {invitation.role}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </TableCell>
                        {(userRole === "owner" || userRole === "admin") && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log("Cancelling invitation:", invitation)
                                console.log("Current activeOrgId:", activeOrgId)
                                handleCancelInvitation(invitation.id)
                              }}
                            >
                              <X size={18} className="text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {userInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                My Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.organizationName || invitation.organizationId || "Unknown Org"}</TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-200">
                            {invitation.role}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleAcceptInvitation(invitation.id)}>
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectInvitation(invitation.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Team Members</CardTitle>
            {(userRole === "owner" || userRole === "admin") && (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2" size={18} />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>Invite a new member to your organization by email</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="member@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isInviting}>
                      {isInviting ? "Inviting..." : "Send Invitation"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {(userRole === "owner" || userRole === "admin") && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={userRole === "owner" || userRole === "admin" ? 4 : 3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No team members yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="hidden sm:table-cell font-medium">{member.name}</TableCell>
                        <TableCell className="font-medium sm:font-normal">{member.email}</TableCell>
                        <TableCell>
                          {(userRole === "owner" || userRole === "admin") && member.userId !== user?.id && member.role !== "owner" ? (
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleUpdateRole(member.userId, value)}
                              disabled={userRole === "admin" && member.role === "admin"} // Admin cannot change other admins or owners
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">member</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                                {userRole === "owner" && <SelectItem value="owner">owner</SelectItem>}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                              {member.role}
                            </span>
                          )}
                        </TableCell>
                        {(userRole === "owner" || userRole === "admin") && member.role !== "owner" && member.userId !== user?.id && (
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveMember(member.email, member.userId)}
                              disabled={userRole === "admin" && member.role === "admin"}
                            >
                              <UserX size={18} className="text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
