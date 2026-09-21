"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import { taskSchema, type TaskInput } from "@/lib/validations/task"
import { useTeamMembers } from "@/hooks/use-team-members"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Task } from "@/components/tasks/task-list"

const UNASSIGNED = "unassigned"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  teamId: string
  task?: Task | null
  onSaved: (task: Task) => void
}

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  teamId,
  task,
  onSaved,
}: TaskFormDialogProps) {
  const isEditing = Boolean(task)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { members } = useTeamMembers(open ? teamId : null)

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", assignee_id: null, due_date: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        assignee_id: task?.assignee_id ?? null,
        due_date: task?.due_date ?? null,
      })
      setFormError(null)
    }
  }, [open, task, form])

  async function onSubmit(values: TaskInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const payload = {
        title: values.title,
        description: values.description || null,
        assignee_id: values.assignee_id || null,
        due_date: values.due_date || null,
      }

      if (isEditing && task) {
        const { data, error } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", task.id)
          .select("id, project_id, title, description, status, assignee_id, due_date, created_by, created_at")
          .single()

        if (error || !data) {
          setFormError("Aufgabe konnte nicht gespeichert werden. Bitte versuche es erneut.")
          return
        }
        onSaved(data)
      } else {
        const { data: userData } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from("tasks")
          .insert({
            project_id: projectId,
            created_by: userData.user?.id ?? null,
            ...payload,
          })
          .select("id, project_id, title, description, status, assignee_id, due_date, created_by, created_at")
          .single()

        if (error || !data) {
          setFormError("Aufgabe konnte nicht erstellt werden. Bitte versuche es erneut.")
          return
        }
        onSaved(data)
      }

      onOpenChange(false)
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Aufgabe bearbeiten" : "Neue Aufgabe"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Ändere die Details dieser Aufgabe." : "Gib der Aufgabe einen Titel."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zuweisung (optional)</FormLabel>
                  <Select
                    value={field.value ?? UNASSIGNED}
                    onValueChange={(value) =>
                      field.onChange(value === UNASSIGNED ? null : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Niemand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Niemand</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fälligkeitsdatum (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Wird gespeichert…"
                  : isEditing
                    ? "Speichern"
                    : "Aufgabe erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
