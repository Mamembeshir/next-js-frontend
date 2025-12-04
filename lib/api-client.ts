import axios, { type AxiosInstance } from "axios";
import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Crucial: sends cookies automatically
    });

    // Optional: Add interceptor to debug cookie issues
    this.client.interceptors.request.use((config) => {
      // console.log("Axios request cookies being sent:", document.cookie)
      return config;
    });
  }

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await authClient.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data: session, error } = await authClient.getSession();
    if (error) throw error;
    return session;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    if (error) throw error;
  }

  async createOrganization(name: string, slug: string) {
    const { data, error } = await authClient.organization.create({
      name,
      slug,
      keepCurrentActiveOrganization: true,
    });
    if (error) throw error;
    return data;
  }

  async listOrganizations() {
    const session = await authClient.getSession();
    if (!session.data) {
      throw new Error("No active session - please sign in");
    }

    const { data, error } = await authClient.organization.list();
    if (error) {
      console.error("listOrganizations failed:", error);
      throw error;
    }

    if (Array.isArray(data)) {
      return Array.from(new Map(data.map((org) => [org.id, org])).values());
    }

    return data;
  }

  async setActiveOrganization(organizationId: string) {
    try {
      const response = await this.client.post(
        "/api/auth/organization/set-active",
        {
          organizationId,
        }
      );
      return response.data;
    } catch (err: any) {
      console.error(
        "Failed to set active organization:",
        err.response?.data || err
      );
      throw err;
    }
  }

  async listMembers(organizationId: string, limit = 100, offset = 0) {
    const { data, error } = await authClient.organization.listMembers({
      query: {
        organizationId,
        limit,
        offset,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    if (error) throw error;
    return data;
  }

  async removeMember(userId: string, organizationId?: string) {
    const { data, error } = await authClient.organization.removeMember({
      memberIdOrEmail: userId,
      organizationId,
    });
    if (error) throw error;
    return data;
  }

  async getActiveMemberRole() {
    const { data, error } = await authClient.organization.getActiveMemberRole();
    if (error) throw error;
    return data;
  }

  async leaveOrganization(organizationId: string) {
    const { error } = await authClient.organization.leave({ organizationId });
    if (error) throw error;
  }

  async createInvitation(
    organizationId: string,
    email: string,
    role: "member" | "admin" | "owner" = "member"
  ) {
    const { data, error } = await authClient.organization.inviteMember({
      email,
      role,
      organizationId,
    });
    if (error) throw error;
    return data;
  }

  async acceptInvitation(invitationId: string) {
    const { error } = await authClient.organization.acceptInvitation({
      invitationId,
    });
    if (error) throw error;
  }

  async cancelInvitation(invitationId: string) {
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (error) throw error;
  }

  async listInvitations(organizationId?: string) {
    const { data, error } = await authClient.organization.listInvitations({
      query: { organizationId },
    });
    if (error) throw error;
    return data;
  }

  async listUserInvitations() {
    const { data, error } = await authClient.organization.listUserInvitations();
    if (error) throw error;
    return data;
  }

  // === CUSTOM API ENDPOINTS (Outlines, etc.) - these use raw axios ===
  async createOutline(orgId: string, outline: any) {
    const { data } = await this.client.post(
      `api/org/${orgId}/outlines`,
      outline
    );
    return data;
  }

  async listOutlines(orgId: string) {
    const { data } = await this.client.get(`api/org/${orgId}/outlines`);
    return data;
  }

  async getOutline(orgId: string, id: string) {
    const { data } = await this.client.get(`api/org/${orgId}/outlines/${id}`);
    return data;
  }

  async updateOutline(orgId: string, id: string, outline: any) {
    const { data } = await this.client.patch(
      `api/org/${orgId}/outlines/${id}`,
      outline
    );
    return data;
  }

  async deleteOutline(orgId: string, id: string) {
    await this.client.delete(`api/org/${orgId}/outlines/${id}`);
  }
}

export const apiClient = new ApiClient();
