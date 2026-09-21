"use client"

import { useCallback, useEffect, useState } from "react"
import { FolderPlus } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectFormDialog } from "@/components/projects/project-form-dialog"
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"

export interface Project {
  id: string
  team_id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
}

interface ProjectListProps {
  teamId: string
}

export function ProjectList({ teamId }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("projects")
      .select("id, team_id, name, description, created_by, created_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProjects(data)
    }
    setIsLoading(false)
  }, [teamId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  function openCreateDialog() {
    setEditingProject(null)
    setIsFormOpen(true)
  }

  function openEditDialog(project: Project) {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  function handleSaved(project: Project) {
    setProjects((current) => {
      const exists = current.some((p) => p.id === project.id)
      return exists
        ? current.map((p) => (p.id === project.id ? project : p))
        : [project, ...current]
    })
  }

  function handleDeleted(projectId: string) {
    setProjects((current) => current.filter((p) => p.id !== projectId))
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projekte</h2>
        <Button onClick={openCreateDialog}>+ Neues Projekt</Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <FolderPlus className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Noch keine Projekte</p>
            <p className="text-sm text-muted-foreground">
              Lege dein erstes Projekt an, um loszulegen.
            </p>
          </div>
          <Button onClick={openCreateDialog}>Erstes Projekt anlegen</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEditDialog}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teamId={teamId}
        project={editingProject}
        onSaved={handleSaved}
      />

      <DeleteProjectDialog
        open={deletingProject !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingProject(null)
        }}
        project={deletingProject}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
