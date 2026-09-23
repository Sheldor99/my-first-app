"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ListTodo } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { useTeamMembers } from "@/hooks/use-team-members"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TASK_STATUSES, type TaskStatus } from "@/lib/validations/task"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskColumn } from "@/components/tasks/task-column"
import { DraggableTaskCard } from "@/components/tasks/draggable-task-card"
import { TaskFormDialog } from "@/components/tasks/task-form-dialog"
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog"
import { TaskCommentsDialog } from "@/components/tasks/task-comments-dialog"
import { TaskAttachmentsDialog } from "@/components/tasks/task-attachments-dialog"

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  assignee_id: string | null
  due_date: string | null
  created_by: string | null
  created_at: string
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

interface TaskBoardProps {
  projectId: string
  teamId: string
}

export function TaskBoard({ projectId, teamId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [commentsTask, setCommentsTask] = useState<Task | null>(null)
  const [attachmentCounts, setAttachmentCounts] = useState<Record<string, number>>({})
  const [attachmentsTask, setAttachmentsTask] = useState<Task | null>(null)
  const { members } = useTeamMembers(teamId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  )

  const fetchCommentCounts = useCallback(async (taskIds: string[]) => {
    if (taskIds.length === 0) {
      setCommentCounts({})
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("task_comments")
      .select("task_id")
      .in("task_id", taskIds)

    if (!error && data) {
      const counts: Record<string, number> = {}
      for (const row of data) {
        counts[row.task_id] = (counts[row.task_id] ?? 0) + 1
      }
      setCommentCounts(counts)
    }
  }, [])

  const fetchAttachmentCounts = useCallback(async (taskIds: string[]) => {
    if (taskIds.length === 0) {
      setAttachmentCounts({})
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("task_attachments")
      .select("task_id")
      .in("task_id", taskIds)

    if (!error && data) {
      const counts: Record<string, number> = {}
      for (const row of data) {
        counts[row.task_id] = (counts[row.task_id] ?? 0) + 1
      }
      setAttachmentCounts(counts)
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, project_id, title, description, status, assignee_id, due_date, created_by, created_at"
      )
      .eq("project_id", projectId)

    if (!error && data) {
      setTasks(data)
      fetchCommentCounts(data.map((task) => task.id))
      fetchAttachmentCounts(data.map((task) => task.id))
    }
    setIsLoading(false)
  }, [projectId, fetchCommentCounts, fetchAttachmentCounts])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const grouped = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] }
    for (const task of tasks) {
      groups[task.status].push(task)
    }
    for (const status of TASK_STATUSES) {
      groups[status].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return a.due_date.localeCompare(b.due_date)
      })
    }
    return groups
  }, [tasks])

  function openCreateDialog() {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  function handleSaved(task: Task) {
    setTasks((current) => {
      const exists = current.some((t) => t.id === task.id)
      return exists ? current.map((t) => (t.id === task.id ? task : t)) : [task, ...current]
    })
  }

  function handleDeleted(taskId: string) {
    setTasks((current) => current.filter((t) => t.id !== taskId))
  }

  const updateTaskStatus = useCallback(async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return

    const previousStatus = task.status
    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id)
      .select("id")

    if (error || !data || data.length === 0) {
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? { ...t, status: previousStatus } : t))
      )
      toast.error("Status konnte nicht geändert werden. Bitte versuche es erneut.")
    }
  }, [])

  const handleCommentsChanged = useCallback((taskId: string, count: number) => {
    setCommentCounts((current) => ({ ...current, [taskId]: count }))
  }, [])

  const handleAttachmentsChanged = useCallback((taskId: string, count: number) => {
    setAttachmentCounts((current) => ({ ...current, [taskId]: count }))
  }, [])

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const task = tasks.find((t) => t.id === active.id)
    const newStatus = over.id as TaskStatus
    if (task) {
      updateTaskStatus(task, newStatus)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Aufgaben</h2>
        <Button onClick={openCreateDialog}>+ Neue Aufgabe</Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <ListTodo className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Noch keine Aufgaben</p>
            <p className="text-sm text-muted-foreground">
              Lege die erste Aufgabe für dieses Projekt an.
            </p>
          </div>
          <Button onClick={openCreateDialog}>Erste Aufgabe anlegen</Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {TASK_STATUSES.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  label={STATUS_LABELS[status]}
                  count={grouped[status].length}
                >
                  {grouped[status].map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      commentCount={commentCounts[task.id] ?? 0}
                      attachmentCount={attachmentCounts[task.id] ?? 0}
                      onEdit={openEditDialog}
                      onDelete={setDeletingTask}
                      onStatusChange={updateTaskStatus}
                      onOpenComments={setCommentsTask}
                      onOpenAttachments={setAttachmentsTask}
                    />
                  ))}
                </TaskColumn>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                members={members}
                onEdit={() => {}}
                onDelete={() => {}}
                onStatusChange={() => {}}
                className="w-72 shadow-lg"
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        projectId={projectId}
        teamId={teamId}
        task={editingTask}
        onSaved={handleSaved}
      />

      <DeleteTaskDialog
        open={deletingTask !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null)
        }}
        task={deletingTask}
        teamId={teamId}
        onDeleted={handleDeleted}
      />

      <TaskCommentsDialog
        open={commentsTask !== null}
        onOpenChange={(open) => {
          if (!open) setCommentsTask(null)
        }}
        task={commentsTask}
        onCommentsChanged={handleCommentsChanged}
      />

      <TaskAttachmentsDialog
        open={attachmentsTask !== null}
        onOpenChange={(open) => {
          if (!open) setAttachmentsTask(null)
        }}
        task={attachmentsTask}
        teamId={teamId}
        onAttachmentsChanged={handleAttachmentsChanged}
      />
    </div>
  )
}
