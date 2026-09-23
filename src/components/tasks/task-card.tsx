"use client"

import { forwardRef } from "react"
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import { GripVertical, MessageSquare, MoreVertical, Paperclip } from "lucide-react"

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
import type { Task } from "@/components/tasks/task-board"
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

export interface TaskCardDragHandleProps {
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
}

interface TaskCardProps {
  task: Task
  members: TeamMemberProfile[]
  commentCount?: number
  attachmentCount?: number
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  onOpenComments?: (task: Task) => void
  onOpenAttachments?: (task: Task) => void
  dragHandleProps?: TaskCardDragHandleProps
  className?: string
  style?: React.CSSProperties
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
  {
    task,
    members,
    commentCount = 0,
    attachmentCount = 0,
    onEdit,
    onDelete,
    onStatusChange,
    onOpenComments,
    onOpenAttachments,
    dragHandleProps,
    className,
    style,
  },
  ref
) {
  const assignee = members.find((m) => m.id === task.assignee_id)
  const overdue = isOverdue(task.due_date, task.status)

  return (
    <Card ref={ref} style={style} className={cn(className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <button
              type="button"
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="mt-0.5 shrink-0 touch-none text-muted-foreground hover:text-foreground"
              aria-label="Aufgabe verschieben"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium">{task.title}</p>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="truncate">
                {assignee ? assignee.email : "Niemand zugewiesen"}
              </span>
              {task.due_date && (
                <span className={cn(overdue && "font-semibold text-destructive")}>
                  Fällig: {task.due_date}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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

        <div className="flex items-center gap-2">
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
          >
            <SelectTrigger className="h-8 flex-1">
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

          {onOpenComments && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2 text-muted-foreground"
              onClick={() => onOpenComments(task)}
            >
              <MessageSquare className="h-4 w-4" />
              {commentCount > 0 && <span className="text-xs">{commentCount}</span>}
              <span className="sr-only">Kommentare</span>
            </Button>
          )}

          {onOpenAttachments && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2 text-muted-foreground"
              onClick={() => onOpenAttachments(task)}
            >
              <Paperclip className="h-4 w-4" />
              {attachmentCount > 0 && <span className="text-xs">{attachmentCount}</span>}
              <span className="sr-only">Anhänge</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
