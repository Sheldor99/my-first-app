"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { TaskCard } from "@/components/tasks/task-card"
import { cn } from "@/lib/utils"
import type { Task } from "@/components/tasks/task-board"
import type { TeamMemberProfile } from "@/hooks/use-team-members"
import type { TaskStatus } from "@/lib/validations/task"

interface DraggableTaskCardProps {
  task: Task
  members: TeamMemberProfile[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}

export function DraggableTaskCard({ task, ...rest }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <TaskCard
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
      dragHandleProps={{ attributes, listeners }}
      task={task}
      {...rest}
    />
  )
}
