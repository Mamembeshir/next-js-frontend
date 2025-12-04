"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal } from "lucide-react"

interface OutlineSheetProps {
  outline?: any
  onSubmit: (data: any) => Promise<void>
  isEdit?: boolean
  trigger?: React.ReactNode
}

const SECTION_TYPES = [
  "Table of Contents",
  "Executive Summary",
  "Technical Approach",
  "Design",
  "Capabilities",
  "Focus Document",
  "Narrative",
]

const REVIEWERS = ["Assim", "Bini", "Mami"]

export function OutlineSheet({ outline, onSubmit, isEdit = false, trigger }: OutlineSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    header: outline?.header || "",
    sectionType: outline?.sectionType || "",
    status: outline?.status || "Pending",
    target: outline?.target || "",
    limit: outline?.limit || "",
    reviewer: outline?.reviewer || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger ? (
          trigger
        ) : isEdit ? (
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={18} />
          </Button>
        ) : (
          <Button>Add Section</Button>
        )}
      </SheetTrigger>
      <SheetContent className="max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Section" : "Add Section"}</SheetTitle>
          <SheetDescription>{isEdit ? "Update the section details" : "Create a new section"}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header">Header</Label>
            <Input
              id="header"
              value={formData.header}
              onChange={(e) => setFormData({ ...formData, header: e.target.value })}
              placeholder="Cover page"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectionType">Section Type</Label>
            <Select
              value={formData.sectionType}
              onValueChange={(value) => setFormData({ ...formData, sectionType: value })}
            >
              <SelectTrigger id="sectionType">
                <SelectValue placeholder="Select section type" />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In-Progress">In-Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number.parseInt(e.target.value) || "" })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Input
                id="limit"
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: Number.parseInt(e.target.value) || "" })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer</Label>
            <Select value={formData.reviewer} onValueChange={(value) => setFormData({ ...formData, reviewer: value })}>
              <SelectTrigger id="reviewer">
                <SelectValue placeholder="Select reviewer" />
              </SelectTrigger>
              <SelectContent>
                {REVIEWERS.map((reviewer) => (
                  <SelectItem key={reviewer} value={reviewer}>
                    {reviewer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
