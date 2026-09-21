"use client"

import { MoreVertical } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TASK_STATUSES, type TaskStatus } from "@/lib/validations/task"
import type { Task } from "@/components/tasks/task-list"
import type { TeamMemberProfile } from "@/hooks/use-team-members"

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "done") return false
  const today = new Date().toISOString().slice(0, 10)
  return dueDate < today
}

interface TaskCardProps {
  task: Task
  members: TeamMemberProfile[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}

export function TaskCard({ task, members, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const assignee = members.find((m) => m.id === task.assignee_id)
  const overdue = isOverdue(task.due_date, task.status)

  async function handleStatusChange(value: string) {
    const status = value as TaskStatus
    const supabase = createClient()
    const { error } = await supabase.from("tasks").update({ status }).eq("id", task.id)
    if (!error) {
      onStatusChange(task, status)
    }
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2 p-4">
        <div className="space-y-1">
          <p className="font-medium">{task.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{assignee ? assignee.email : "Niemand zugewiesen"}</span>
            {task.due_date && (
              <span className={cn(overdue && "font-semibold text-destructive")}>
                Fällig: {task.due_date}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Aufgaben-Menü</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive"
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
