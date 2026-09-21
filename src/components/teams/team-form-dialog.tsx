"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CreateTeamForm } from "@/components/teams/create-team-form"
import type { Team } from "@/hooks/use-teams"

interface TeamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (team: Team) => void
}

export function TeamFormDialog({ open, onOpenChange, onCreated }: TeamFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team erstellen</DialogTitle>
          <DialogDescription>
            Gib deinem Team einen Namen. Du wirst automatisch Owner.
          </DialogDescription>
        </DialogHeader>

        <CreateTeamForm
          onCreated={(team) => {
            onCreated(team)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
