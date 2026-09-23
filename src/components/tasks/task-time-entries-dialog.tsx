"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { useTaskTimeEntries, type TaskTimeEntry } from "@/hooks/use-task-time-entries"
import {
  timeEntrySchema,
  hoursToMinutes,
  minutesToHours,
  formatDuration,
  type TimeEntryInput,
} from "@/lib/validations/time-entry"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Task } from "@/components/tasks/task-board"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatEntryDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

interface TaskTimeEntriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onTotalChanged: (taskId: string, totalMinutes: number) => void
}

export function TaskTimeEntriesDialog({
  open,
  onOpenChange,
  task,
  onTotalChanged,
}: TaskTimeEntriesDialogProps) {
  const taskId = task?.id ?? null
  const { entries, isLoading, refetchEntries } = useTaskTimeEntries(open ? taskId : null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TaskTimeEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalMinutes = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.duration_minutes, 0),
    [entries]
  )

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [open])

  useEffect(() => {
    if (open && taskId && !isLoading) {
      onTotalChanged(taskId, totalMinutes)
    }
  }, [open, taskId, isLoading, totalMinutes, onTotalChanged])

  useEffect(() => {
    if (!open) {
      setEditingEntry(null)
    }
  }, [open])

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: { entry_date: todayIso(), hours: "", note: "" },
  })

  const editForm = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: { entry_date: todayIso(), hours: "", note: "" },
  })

  useEffect(() => {
    if (editingEntry) {
      editForm.reset({
        entry_date: editingEntry.entry_date,
        hours: String(minutesToHours(editingEntry.duration_minutes)),
        note: editingEntry.note ?? "",
      })
    }
  }, [editingEntry, editForm])

  async function onSubmit(values: TimeEntryInput) {
    if (!taskId || !currentUserId) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("task_time_entries").insert({
        task_id: taskId,
        user_id: currentUserId,
        entry_date: values.entry_date,
        duration_minutes: hoursToMinutes(Number(values.hours)),
        note: values.note || null,
      })

      if (error) {
        toast.error("Zeiteintrag konnte nicht gespeichert werden. Bitte versuche es erneut.")
        return
      }

      form.reset({ entry_date: todayIso(), hours: "", note: "" })
      await refetchEntries()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onEditSubmit(values: TimeEntryInput) {
    if (!editingEntry) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("task_time_entries")
        .update({
          entry_date: values.entry_date,
          duration_minutes: hoursToMinutes(Number(values.hours)),
          note: values.note || null,
        })
        .eq("id", editingEntry.id)

      if (error) {
        toast.error("Zeiteintrag konnte nicht gespeichert werden. Bitte versuche es erneut.")
        return
      }

      setEditingEntry(null)
      await refetchEntries()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(entry: TaskTimeEntry) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("task_time_entries").delete().eq("id", entry.id)

      if (error) {
        toast.error("Zeiteintrag konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      await refetchEntries()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Zeiterfassung
            {totalMinutes > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Gesamt: {formatDuration(totalMinutes)})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{task?.title}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Noch keine Zeit erfasst</p>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4 pr-4">
              {entries.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-medium">{formatDuration(entry.duration_minutes)}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatEntryDate(entry.entry_date)} ·{" "}
                        {entry.user_email ?? "Ehemaliges Mitglied"}
                      </span>
                    </div>
                    {entry.user_id === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                            <span className="sr-only">Zeiteintrag-Menü</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(entry)}
                            className="text-destructive focus:text-destructive"
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingEntry?.id === entry.id ? (
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-2">
                        <div className="flex gap-2">
                          <FormField
                            control={editForm.control}
                            name="entry_date"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input type="date" max={todayIso()} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="hours"
                            render={({ field }) => (
                              <FormItem className="w-28">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    max="24"
                                    placeholder="Std."
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={editForm.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Notiz (optional)"
                                  rows={2}
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            Speichern
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEntry(null)}
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    entry.note && (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.note}</p>
                    )
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 border-t pt-4">
            <FormLabel className="text-sm">Zeit erfassen</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="date" max={todayIso()} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem className="w-28">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        max="24"
                        placeholder="Std."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Notiz (optional)"
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || !taskId}>
              {isSubmitting ? "Wird gespeichert…" : "Zeit erfassen"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
