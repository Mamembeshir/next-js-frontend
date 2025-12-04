"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { useOrganization } from "@/lib/org-context"

export default function CreateOrganizationPage() {
  const router = useRouter()
  const { setActiveOrgId, setActiveOrgName } = useOrganization()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const org = await apiClient.createOrganization(name, slug)
      setActiveOrgId(org.id)
      setActiveOrgName(name)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create organization")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
        <CardDescription>Create a new organization to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Acme Inc"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSlug(generateSlug(e.target.value))
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              type="text"
              placeholder="acme-inc"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
