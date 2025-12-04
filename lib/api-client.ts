import axios, { type AxiosInstance } from "axios"
import { authClient } from "@/lib/auth-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Enable cookies for Better Auth
    })

    // No need for Authorization header - Better Auth uses cookies
  }

  // Auth endpoints
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    })
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async signOut() {
    const { data, error } = await authClient.signOut()
    if (error) throw error
    return data
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const { data, error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    if (error) throw error
    return data
  }

  // Organization endpoints
  async createOrganization(name: string, slug: string) {
    const { data, error } = await authClient.organization.create({ name, slug,keepCurrentActiveOrganization:true })
    if (error) throw error
    return data
  }



  async setActiveOrganization(organizationId: string) {
    // CRITICAL: Make a direct API call to update the server session
    // setActive() only updates client state, we need to hit the backend endpoint
    console.log("setActiveOrganization - Making POST request to update server session")
    const { data } = await this.client.post("api/auth/organization/set-active", {
      organizationId,
    })
    console.log("setActiveOrganization - Server response:", data)
    return data
  }

  async listMembers(organizationId: string, limit = 100, offset = 0, sortBy = "createdAt") {
    console.log("🔍 listMembers - organizationId:", organizationId)
    const { data, error } = await authClient.organization.listMembers({
      query: {
        organizationId,
        limit,
        offset,
        sortBy,
        sortDirection: "desc",
      },
    })
    console.log("🔍 listMembers - raw response:", { data, error })
    if (error) {
      console.error("🔍 listMembers - error:", error)
      throw error
    }
    
    // Ensure we return the data even if it's empty or in an unexpected format
    console.log("🔍 listMembers - returning data:", data)
    return data
  }

  async removeMember(userId: string, organizationId?: string,) {
    console.log("removeMember - removing:", userId, "from org:", organizationId)
    
    // Check role RIGHT BEFORE calling authClient
    const roleCheck = await authClient.organization.getActiveMemberRole()
    console.log("🔍🔍 INSIDE removeMember - Role check:", roleCheck)
    
    const { data, error } = await authClient.organization.removeMember({
      memberIdOrEmail: userId,
      organizationId, // Pass it explicitly
    })
    console.log("removeMember - result:", { data, error })
    if (error) throw error
    return data
  }

  async getActiveMemberRole() {
    const { data, error } = await authClient.organization.getActiveMemberRole()
    console.log("getActiveMemberRole - data:", data)
    console.log("getActiveMemberRole - error:", error)
    if (error) throw error
    return data
  }

  async getActiveMember() {
    const { data, error } = await authClient.organization.getActiveMember()
    console.log("getActiveMember - data:", data)
    console.log("getActiveMember - error:", error)
    if (error) throw error
    return data
  }

  async leaveOrganization(organizationId: string) {
    const { data, error } = await authClient.organization.leave({ organizationId })
    if (error) throw error
    return data
  }

  async createInvitation(organizationId: string, email: string, role: "member" | "admin" | "owner" = "member") {
    console.log("createInvitation - params:", { organizationId, email, role })
    const { data, error } = await authClient.organization.inviteMember({
      email,
      role,
      organizationId // Pass it explicitly
    })
    console.log("createInvitation - result:", { data, error })
    if (error) throw error
    return data
  }

  async acceptInvitation(invitationId: string) {
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId,
    })
    if (error) throw error
    return data
  }

  async rejectInvitation(invitationId: string) {
    const { data, error } = await authClient.organization.rejectInvitation({
      invitationId,
    })
    if (error) throw error
    return data
  }

  async cancelInvitation(invitationId: string) {
    console.log("cancelInvitation - params:", { invitationId })
    
    // Check role RIGHT BEFORE calling authClient
    const roleCheck = await authClient.organization.getActiveMemberRole()
    console.log("🔍🔍 INSIDE cancelInvitation - Role check:", roleCheck)
    
    const { data, error } = await authClient.organization.cancelInvitation({
      invitationId,
    })
    console.log("cancelInvitation - result:", { data, error })
    if (error) throw error
    return data
  }

  async getInvitation(id: string) {
    const { data } = await this.client.get(`api/organization/invitation/${id}`)
    return data
  }

  async listInvitations(organizationId?: string) {
    const { data, error } = await authClient.organization.listInvitations({
      query: { organizationId },
    })
    if (error) throw error
    return data
  }

  async listUserInvitations() {
    const { data, error } = await authClient.organization.listUserInvitations()
    if (error) throw error
    return data
  }


  // Outline endpoints
  async createOutline(
    orgId: string,
    outline: {
      header: string
      sectionType: string
      status?: "Pending" | "In-Progress" | "Completed"
      target: number
      limit: number
      reviewer: string
    },
  ) {
    const { data } = await this.client.post(`api/org/${orgId}/outlines`, outline)
    return data
  }

  async listOutlines(orgId: string) {
    const { data } = await this.client.get(`api/org/${orgId}/outlines`)
    return data
  }

  async getOutline(orgId: string, id: string) {
    const { data } = await this.client.get(`api/org/${orgId}/outlines/${id}`)
    return data
  }

  async updateOutline(orgId: string, id: string, outline: any) {
    const { data } = await this.client.patch(`api/org/${orgId}/outlines/${id}`, outline)
    return data
  }

  async deleteOutline(orgId: string, id: string) {
    const { data } = await this.client.delete(`api/org/${orgId}/outlines/${id}`)
    return data
  }


  async listOrganizations() {
    const { data, error } = await authClient.organization.list()
    console.log("listOrganizations - data from Better Auth:", data)
    if (error) {
      console.error("listOrganizations - error:", error)
      throw error
    }
    
    // Deduplicate organizations by ID
    if (Array.isArray(data)) {
      const uniqueOrgs = Array.from(
        new Map(data.map((org: any) => [org.id, org])).values()
      )
      console.log("listOrganizations - after deduplication:", uniqueOrgs)
      return uniqueOrgs
    }
    
    return data
  }
}

export const apiClient = new ApiClient()
