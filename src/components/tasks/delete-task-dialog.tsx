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
import type { Task } from "@/components/tasks/task-board"

interface DeleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  teamId: string
  onDeleted: (taskId: string) => void
}

export function DeleteTaskDialog({
  open,
  onOpenChange,
  task,
  teamId,
  onDeleted,
}: DeleteTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!task) return
    setIsDeleting(true)

    try {
      const supabase = createClient()

      const attachmentFolder = `${teamId}/${task.id}`
      const { data: files } = await supabase.storage.from("task-attachments").list(attachmentFolder)
      if (files && files.length > 0) {
        await supabase.storage
          .from("task-attachments")
          .remove(files.map((file) => `${attachmentFolder}/${file.name}`))
      }

      const { error } = await supabase.from("tasks").delete().eq("id", task.id)

      if (error) {
        toast.error("Aufgabe konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      onDeleted(task.id)
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
          <AlertDialogTitle>Aufgabe löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Aufgabe „{task?.title}" wird unwiderruflich gelöscht.
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
