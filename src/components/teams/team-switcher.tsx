"use client"

import { useState } from "react"
import { ChevronsUpDown, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TeamFormDialog } from "@/components/teams/team-form-dialog"
import { ManageTeamDialog } from "@/components/teams/manage-team-dialog"
import type { Team } from "@/hooks/use-teams"

interface TeamSwitcherProps {
  teams: Team[]
  activeTeamId: string | null
  onSelectTeam: (teamId: string) => void
  onTeamCreated: (team: Team) => void
  onTeamsChanged: () => void
}

export function TeamSwitcher({
  teams,
  activeTeamId,
  onSelectTeam,
  onTeamCreated,
  onTeamsChanged,
}: TeamSwitcherProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const activeTeam = teams.find((team) => team.id === activeTeamId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between gap-2">
            {activeTeam?.name ?? "Team wählen"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Deine Teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {teams.map((team) => (
            <DropdownMenuItem key={team.id} onClick={() => onSelectTeam(team.id)}>
              {team.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {activeTeam && (
            <DropdownMenuItem onClick={() => setIsManageOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Team verwalten
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Team erstellen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TeamFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(team) => {
          onTeamCreated(team)
          onSelectTeam(team.id)
        }}
      />

      <ManageTeamDialog
        open={isManageOpen}
        onOpenChange={setIsManageOpen}
        team={activeTeam ?? null}
        onSelfLeft={onTeamsChanged}
        onTeamDeleted={onTeamsChanged}
      />
    </>
  )
}
