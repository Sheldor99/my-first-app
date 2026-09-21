"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { useTeamMembers, type TeamMemberProfile } from "@/hooks/use-team-members"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AddMemberForm } from "@/components/teams/add-member-form"
import { RemoveMemberDialog } from "@/components/teams/remove-member-dialog"
import { DeleteTeamDialog } from "@/components/teams/delete-team-dialog"
import type { Team } from "@/hooks/use-teams"

interface ManageTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onSelfLeft: () => void
  onTeamDeleted: (teamId: string) => void
}

export function ManageTeamDialog({
  open,
  onOpenChange,
  team,
  onSelfLeft,
  onTeamDeleted,
}: ManageTeamDialogProps) {
  const teamId = team?.id ?? null
  const { members, isLoading, refetchMembers } = useTeamMembers(open ? teamId : null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<TeamMemberProfile | null>(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [open])

  const currentMember = members.find((m) => m.id === currentUserId)
  const isOwner = currentMember?.role === "owner"

  async function handleRoleChange(member: TeamMemberProfile, newRole: "owner" | "member") {
    if (!teamId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("team_members")
      .update({ role: newRole })
      .eq("team_id", teamId)
      .eq("user_id", member.id)

    if (error) {
      toast.error(
        member.id === currentUserId
          ? "Der letzte verbleibende Owner kann die eigene Rolle nicht abgeben."
          : "Rolle konnte nicht geändert werden. Bitte versuche es erneut."
      )
      return
    }

    refetchMembers()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Team verwalten</DialogTitle>
            <DialogDescription>
              Mitglieder von „{team?.name}" ansehen{isOwner ? " und verwalten" : ""}.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  {isOwner && <TableHead className="text-right">Aktion</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="max-w-[200px] truncate">{member.email}</TableCell>
                    <TableCell>
                      {isOwner ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleRoleChange(member, value as "owner" | "member")
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm capitalize">{member.role}</span>
                      )}
                    </TableCell>
                    {isOwner && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMemberToRemove(member)}
                        >
                          Entfernen
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isOwner && teamId && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">Mitglied hinzufügen</p>
                <AddMemberForm teamId={teamId} onAdded={refetchMembers} />
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setIsLeaveDialogOpen(true)}>
              Team verlassen
            </Button>
            {isOwner && (
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                Team löschen
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RemoveMemberDialog
        open={memberToRemove !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setMemberToRemove(null)
        }}
        teamId={teamId ?? ""}
        member={memberToRemove}
        isSelf={memberToRemove?.id === currentUserId}
        onRemoved={() => {
          const removedSelf = memberToRemove?.id === currentUserId
          refetchMembers()
          if (removedSelf) {
            onOpenChange(false)
            onSelfLeft()
          }
        }}
      />

      <RemoveMemberDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        teamId={teamId ?? ""}
        member={currentMember ?? null}
        isSelf
        onRemoved={() => {
          onOpenChange(false)
          onSelfLeft()
        }}
      />

      <DeleteTeamDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        team={team}
        onDeleted={(deletedTeamId) => {
          onOpenChange(false)
          onTeamDeleted(deletedTeamId)
        }}
      />
    </>
  )
}
