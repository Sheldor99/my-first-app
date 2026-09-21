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
import type { TeamMemberProfile } from "@/hooks/use-team-members"

interface RemoveMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  member: TeamMemberProfile | null
  isSelf: boolean
  onRemoved: () => void
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  teamId,
  member,
  isSelf,
  onRemoved,
}: RemoveMemberDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  async function handleRemove() {
    if (!member) return
    setIsRemoving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", member.id)

      if (error) {
        toast.error(
          isSelf
            ? "Der letzte verbleibende Owner kann das Team nicht verlassen."
            : "Mitglied konnte nicht entfernt werden. Bitte versuche es erneut."
        )
        return
      }

      onRemoved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isSelf ? "Team verlassen?" : "Mitglied entfernen?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isSelf
              ? "Du verlierst den Zugriff auf dieses Team und alle zugehörigen Projekte und Aufgaben."
              : `„${member?.email}" verliert den Zugriff auf dieses Team und alle zugehörigen Projekte und Aufgaben.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleRemove()
            }}
            disabled={isRemoving}
          >
            {isRemoving ? "Wird verarbeitet…" : isSelf ? "Team verlassen" : "Entfernen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
