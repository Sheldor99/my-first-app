"use client"

import { useState } from "react"
import { toast } from "sonner"

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
import type { Team } from "@/hooks/use-teams"

interface DeleteTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onDeleted: (teamId: string) => void
}

export function DeleteTeamDialog({ open, onOpenChange, team, onDeleted }: DeleteTeamDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!team) return
    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("teams").delete().eq("id", team.id)

      if (error) {
        toast.error("Team konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      onDeleted(team.id)
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
          <AlertDialogTitle>Team löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Team „{team?.name}" sowie alle zugehörigen Projekte, Aufgaben und
            Mitgliedschaften werden unwiderruflich gelöscht.
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
