"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "@/lib/org-context";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OutlineSheet } from "@/components/outline-sheet";
import {
  MoreVertical,
  GripVertical,
  Plus,
  Columns,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Outline {
  id: string;
  header: string;
  sectionType: string;
  status: "Pending" | "In-Progress" | "Completed";
  target: number;
  limit: number;
  reviewer: string;
  order?: number;
}

type VisibleColumns = {
  sectionType: boolean;
  status: boolean;
  target: boolean;
  limit: boolean;
  reviewer: boolean;
};

// Sortable Row Component
function SortableRow({
  outline,
  onUpdate,
  onDelete,
  visibleColumns,
}: {
  outline: Outline;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  visibleColumns: VisibleColumns;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: outline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700 gap-1 font-normal"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Done
          </Badge>
        );
      case "In-Progress":
        return (
          <Badge
            variant="outline"
            className="bg-white text-muted-foreground border-border hover:bg-white hover:text-muted-foreground gap-1 font-normal"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 3V6L8 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            In Process
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-600 gap-1 font-normal"
          >
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group">
      <TableCell className="w-10 sm:w-12">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} className="text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="w-10 sm:w-12">
        <Checkbox className="translate-y-[2px]" />
      </TableCell>
      <TableCell className="font-medium w-32 sm:w-auto">
        <OutlineSheet
          outline={outline}
          onSubmit={(data) => onUpdate(outline.id, data)}
          isEdit
          trigger={
            <span className="cursor-pointer hover:underline truncate block">
              {outline.header}
            </span>
          }
        />
      </TableCell>
      {visibleColumns.sectionType && (
        <TableCell className="hidden md:table-cell w-28 sm:w-auto">
          <Select
            value={outline.sectionType}
            onValueChange={async (value) => {
              await onUpdate(outline.id, { ...outline, sectionType: value });
            }}
          >
            <SelectTrigger className="h-7 w-full border-0 p-0 shadow-none hover:bg-muted/50">
              <SelectValue asChild>
                <Badge
                  variant="secondary"
                  className="font-normal bg-muted/50 text-muted-foreground hover:bg-muted/50 text-xs w-full justify-start cursor-pointer"
                >
                  {outline.sectionType}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[
                "Table of Contents",
                "Executive Summary",
                "Technical Approach",
                "Design",
                "Capabilities",
                "Focus Document",
                "Narrative",
              ].map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      )}
      {visibleColumns.status && (
        <TableCell className="hidden sm:table-cell w-28 sm:w-auto">
          {getStatusBadge(outline.status)}
        </TableCell>
      )}
      {visibleColumns.target && (
        <TableCell className="text-right hidden lg:table-cell text-muted-foreground w-16 sm:w-20">
          {outline.target}
        </TableCell>
      )}
      {visibleColumns.limit && (
        <TableCell className="text-right hidden xl:table-cell text-muted-foreground w-16 sm:w-20">
          {outline.limit}
        </TableCell>
      )}
      {visibleColumns.reviewer && (
        <TableCell className="hidden lg:table-cell text-muted-foreground w-24 sm:w-auto">
          {outline.reviewer}
        </TableCell>
      )}
      <TableCell className="w-10 sm:w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreVertical size={16} className="text-muted-foreground" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem asChild>
              <OutlineSheet
                outline={outline}
                onSubmit={(data) => onUpdate(outline.id, data)}
                isEdit
                trigger={<span className="w-full cursor-default">Edit</span>}
              />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(outline.id)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { activeOrgId, setActiveOrgId } = useOrganization();
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [hasNoOrg, setHasNoOrg] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    sectionType: true,
    status: true,
    target: true,
    limit: false,
    reviewer: true,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkOrganizationAndFetchOutlines();
  }, [activeOrgId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOutlines((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const checkOrganizationAndFetchOutlines = async () => {
    if (activeOrgId) {
      fetchOutlines();
      return;
    }

    // If no active org, try to fetch list
    try {
      const orgs = await apiClient.listOrganizations();
      if (orgs && orgs.length > 0) {
        // Found organizations, set the first one as active
        setActiveOrgId(orgs[0].id);
      } else {
        // No organizations found, show empty state
        setHasNoOrg(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to check organizations:", error);
      setIsLoading(false);
    }
  };


  const handleAddOutline = async (formData: any) => {
    if (!activeOrgId) return;
    try {
      const newOutline = await apiClient.createOutline(activeOrgId, formData);
      setOutlines([...outlines, newOutline]);
    } catch (error) {
      console.error("Failed to create outline:", error);
    }
  };

  const handleUpdateOutline = async (id: string, formData: any) => {
    if (!activeOrgId) return;
    try {
      await apiClient.updateOutline(activeOrgId, id, formData);
      setOutlines(
        outlines.map((o) => (o.id === id ? { ...o, ...formData } : o))
      );
    } catch (error) {
      console.error("Failed to update outline:", error);
    }
  };

  const handleDeleteOutline = async (id: string) => {
    if (!activeOrgId) return;
    try {
      await apiClient.deleteOutline(activeOrgId, id);
      setOutlines(outlines.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Failed to delete outline:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading outlines...
      </div>
    );
  }

  if (hasNoOrg) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold">No Organization Found</h1>
          <p className="text-muted-foreground">
            You are not currently a member of any organization. You can create
            your own organization or check for pending invitations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/create-organization")}>
              Create Organization
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/choose-action")}
            >
              View Options
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full h-full">
      <div className="p-4 sm:p-6 flex flex-col h-full w-full gap-6">
        {/* ---- Header Tabs / Actions ---- */}
        <Tabs defaultValue="outline" className="w-full flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Mobile Tab Selector */}
            <div className="lg:hidden w-full">
              <Select defaultValue="outline">
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="Outline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="past-performance">
                    Past Performance
                  </SelectItem>
                  <SelectItem value="key-personnel">Key Personnel</SelectItem>
                  <SelectItem value="focus-documents">
                    Focus Documents
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Tabs */}
            <TabsList className="hidden lg:flex bg-muted text-muted-foreground h-10 rounded-lg p-1">
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="past-performance" className="gap-1">
                Past Performance{" "}
                <span className="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                  3
                </span>
              </TabsTrigger>
              <TabsTrigger value="key-personnel" className="gap-1">
                Key Personnel{" "}
                <span className="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                  2
                </span>
              </TabsTrigger>
              <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
            </TabsList>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 justify-between lg:justify-end w-full lg:w-auto">
              {/* Columns Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1 px-3"
                  >
                    <Columns size={16} />
                    <span className="hidden lg:inline">Customize Columns</span>
                    <span className="lg:hidden">Columns</span>
                    <ChevronDown size={16} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 max-h-60 overflow-y-auto"
                >
                  {[
                    { id: "sectionType", label: "Type" },
                    { id: "status", label: "Status" },
                    { id: "target", label: "Target" },
                    { id: "limit", label: "Limit" },
                    { id: "reviewer", label: "Reviewer" },
                  ].map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => toggleColumn(col.id as any)}
                      className="flex justify-between text-sm"
                    >
                      {col.label}
                      {visibleColumns[
                        col.id as keyof typeof visibleColumns
                      ] && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className="text-green-600"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Section */}
              <OutlineSheet
                onSubmit={handleAddOutline}
                trigger={
                  <Button size="sm" className="h-9 gap-2 px-3">
                    <Plus size={16} />
                    <span className="hidden lg:inline">Add Section</span>
                  </Button>
                }
              />
            </div>
          </div>

          {/* ---- CONTENT ---- */}
          <TabsContent value="outline">
            {/* TABLE WRAPPER */}
            <div className="border rounded-lg w-full overflow-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={outlines.map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {/* Use shadcn Table with its built-in responsive container */}
                  <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-10 sm:w-12"></TableHead>
                        <TableHead className="w-10 sm:w-12"></TableHead>
                        <TableHead className="w-32 sm:w-auto">Header</TableHead>
                        {visibleColumns.sectionType && (
                          <TableHead className="hidden md:table-cell w-28 sm:w-auto">
                            Section Type
                          </TableHead>
                        )}
                        {visibleColumns.status && (
                          <TableHead className="hidden sm:table-cell w-28 sm:w-auto">
                            Status
                          </TableHead>
                        )}
                        {visibleColumns.target && (
                          <TableHead className="text-right hidden lg:table-cell w-16 sm:w-20">
                            Target
                          </TableHead>
                        )}
                        {visibleColumns.limit && (
                          <TableHead className="text-right hidden xl:table-cell w-16 sm:w-20">
                            Limit
                          </TableHead>
                        )}
                        {visibleColumns.reviewer && (
                          <TableHead className="hidden lg:table-cell w-24 sm:w-auto">
                            Reviewer
                          </TableHead>
                        )}
                        <TableHead className="w-10 sm:w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outlines.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No outlines yet. Create one to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        outlines.map((outline) => (
                          <SortableRow
                            key={outline.id}
                            outline={outline}
                            onUpdate={handleUpdateOutline}
                            onDelete={handleDeleteOutline}
                            visibleColumns={visibleColumns}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </SortableContext>
              </DndContext>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 py-3">
              <div className="text-muted-foreground text-sm">
                0 of {outlines.length} row(s) selected.
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden sm:inline">
                  Rows per page
                </span>
                <Select defaultValue="10">
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm font-medium ml-2">Page 1 of 1</div>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hidden sm:flex"
                    disabled
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hidden sm:flex"
                    disabled
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
