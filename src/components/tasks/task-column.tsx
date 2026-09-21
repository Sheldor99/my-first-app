"use client"

import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/lib/validations/task"

interface TaskColumnProps {
  status: TaskStatus
  label: string
  count: number
  children: React.ReactNode
}

export function TaskColumn({ status, label, count, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="w-72 shrink-0 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {label} ({count})
      </h3>
      <div
        ref={setNodeRef}
        className={cn(
          "flex max-h-[calc(100vh-320px)] min-h-24 flex-col gap-2 overflow-y-auto rounded-lg border border-dashed p-2 transition-colors",
          isOver && "border-primary bg-accent/50"
        )}
      >
        {children}
      </div>
    </div>
  )
}
