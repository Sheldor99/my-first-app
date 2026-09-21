"use client"

import Link from "next/link"
import { MoreVertical } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/components/projects/project-list"

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle>
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </CardTitle>
          {project.description && (
            <CardDescription>{project.description}</CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Projekt-Menü</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>Bearbeiten</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  )
}
