"use client"

import { useState, useEffect } from "react"
import { useOrganization } from "@/lib/org-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GalleryVerticalEnd, AudioWaveform, Command, ChevronDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Organization {
  id: string
  name: string
  slug: string
}

export function OrganizationSwitcher() {
  const router = useRouter()
  const { activeOrgId, activeOrgName, organizations, setOrganizations, switchOrganization, clearOrganization } = useOrganization()
  const [isLoading, setIsLoading] = useState(false)

  // Icons for organizations to match the design
  const icons = [GalleryVerticalEnd, AudioWaveform, Command]

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    setIsLoading(true)
    try {
      console.log("OrganizationSwitcher - fetching organizations...")
      const data = await apiClient.listOrganizations()
      console.log("OrganizationSwitcher - received data:", data)
      if (data) {
        console.log("OrganizationSwitcher - setting organizations:", data)
        setOrganizations(data)
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear stale organization when switching accounts
  useEffect(() => {
    if (organizations.length > 0 && activeOrgId) {
      const orgExists = organizations.some(org => org.id === activeOrgId)
      if (!orgExists) {
        console.log("OrganizationSwitcher - Active org not found in list, clearing...")
        clearOrganization()
      }
    }
  }, [organizations, activeOrgId])

  const handleSwitchOrg = (org: Organization) => {
    switchOrganization(org.id, org.name)
    router.refresh()
  }

  const handleCreateOrg = () => {
    router.push("/create-organization")
  }

  // Get the icon for the active organization
  const activeOrgIndex = organizations.findIndex(org => org.id === activeOrgId)
  const ActiveIcon = activeOrgIndex !== -1 ? icons[activeOrgIndex % icons.length] : GalleryVerticalEnd

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12">
          <div className="flex items-center gap-3 text-left">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <ActiveIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeOrgName || "Select Team"}</span>
              <span className="truncate text-xs">Enterprise</span>
            </div>
          </div>
          <ChevronDown className="ml-auto size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" 
        align="start" 
        side="right" 
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
        {isLoading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : organizations.length > 0 ? (
          organizations.map((org, index) => {
            const OrgIcon = icons[index % icons.length]
            return (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrg(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <OrgIcon className="size-4 shrink-0" />
                </div>
                {org.name}
                <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                  ⌘{index + 1}
                </span>
              </DropdownMenuItem>
            )
          })
        ) : (
          <DropdownMenuItem disabled>No teams</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateOrg} className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">Add team</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
