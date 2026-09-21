"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ListTodo } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { useTeamMembers } from "@/hooks/use-team-members"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TASK_STATUSES, type TaskStatus } from "@/lib/validations/task"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskFormDialog } from "@/components/tasks/task-form-dialog"
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog"

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

interface TaskListProps {
  projectId: string
  teamId: string
}

export function TaskList({ projectId, teamId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const { members } = useTeamMembers(teamId)

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
    }
    setIsLoading(false)
  }, [projectId])

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

  function handleStatusChange(task: Task, status: TaskStatus) {
    setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, status } : t)))
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
        <div className="space-y-6">
          {TASK_STATUSES.map((status) =>
            grouped[status].length > 0 ? (
              <div key={status} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {STATUS_LABELS[status]} ({grouped[status].length})
                </h3>
                <div className="space-y-2">
                  {grouped[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      onEdit={openEditDialog}
                      onDelete={setDeletingTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
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
        onDeleted={handleDeleted}
      />
    </div>
  )
}
