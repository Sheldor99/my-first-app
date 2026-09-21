"use client"

import { useState } from "react"

import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Project } from "@/components/projects/project-list"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onDeleted: (projectId: string) => void
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onDeleted,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!project) return
    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("projects").delete().eq("id", project.id)

      if (error) {
        toast.error("Projekt konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      onDeleted(project.id)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Projekt „{project?.name}" und alle zugehörigen Aufgaben werden
            unwiderruflich gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Wird gelöscht…" : "Löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
