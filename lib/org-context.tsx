"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Organization {
  id: string
  name: string
  slug: string
}

interface OrganizationContextType {
  activeOrgId: string | null
  activeOrgName: string | null
  organizations: Organization[]
  setActiveOrgId: (orgId: string | null) => void
  setActiveOrgName: (name: string | null) => void
  setOrganizations: (orgs: Organization[]) => void
  switchOrganization: (orgId: string, orgName: string) => void
  clearOrganization: () => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null)
  const [activeOrgName, setActiveOrgName] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])

  // Load active org from localStorage on mount
  useEffect(() => {
    const storedOrgId = localStorage.getItem("active_org_id")
    const storedOrgName = localStorage.getItem("active_org_name")
    if (storedOrgId) {
      setActiveOrgIdState(storedOrgId)
    }
    if (storedOrgName) {
      setActiveOrgName(storedOrgName)
    }
  }, [])

  // Debug logging for organizations state
  useEffect(() => {
    console.log("OrganizationContext - organizations state changed:", organizations)
  }, [organizations])

  const setActiveOrgId = (orgId: string | null) => {
    setActiveOrgIdState(orgId)
    if (orgId) {
      localStorage.setItem("active_org_id", orgId)
    } else {
      localStorage.removeItem("active_org_id")
    }
  }

  const switchOrganization = (orgId: string, orgName: string) => {
    setActiveOrgId(orgId)
    setActiveOrgName(orgName)
    localStorage.setItem("active_org_name", orgName)
  }

  const clearOrganization = () => {
    setActiveOrgIdState(null)
    setActiveOrgName(null)
    localStorage.removeItem("active_org_id")
    localStorage.removeItem("active_org_name")
  }

  return (
    <OrganizationContext.Provider
      value={{
        activeOrgId,
        activeOrgName,
        organizations,
        setActiveOrgId,
        setActiveOrgName,
        setOrganizations,
        switchOrganization,
        clearOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganization must be used within OrganizationProvider")
  }
  return context
}
