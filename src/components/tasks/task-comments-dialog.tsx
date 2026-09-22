"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { useTaskComments, type TaskComment } from "@/hooks/use-task-comments"
import { commentSchema, type CommentInput } from "@/lib/validations/comment"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import type { Task } from "@/components/tasks/task-board"

interface TaskCommentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onCommentsChanged: (taskId: string, count: number) => void
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TaskCommentsDialog({
  open,
  onOpenChange,
  task,
  onCommentsChanged,
}: TaskCommentsDialogProps) {
  const taskId = task?.id ?? null
  const { comments, isLoading, refetchComments } = useTaskComments(open ? taskId : null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [open])

  useEffect(() => {
    if (open && taskId && !isLoading) {
      onCommentsChanged(taskId, comments.length)
    }
  }, [open, taskId, isLoading, comments.length, onCommentsChanged])

  useEffect(() => {
    if (!open) {
      setEditingComment(null)
    }
  }, [open])

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  })

  const editForm = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  })

  useEffect(() => {
    if (editingComment) {
      editForm.reset({ body: editingComment.body })
    }
  }, [editingComment, editForm])

  async function onSubmit(values: CommentInput) {
    if (!taskId || !currentUserId) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("task_comments")
        .insert({ task_id: taskId, author_id: currentUserId, body: values.body })

      if (error) {
        toast.error("Kommentar konnte nicht gespeichert werden. Bitte versuche es erneut.")
        return
      }

      form.reset()
      await refetchComments()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onEditSubmit(values: CommentInput) {
    if (!editingComment) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("task_comments")
        .update({ body: values.body })
        .eq("id", editingComment.id)

      if (error) {
        toast.error("Kommentar konnte nicht gespeichert werden. Bitte versuche es erneut.")
        return
      }

      setEditingComment(null)
      await refetchComments()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(comment: TaskComment) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("task_comments").delete().eq("id", comment.id)

      if (error) {
        toast.error("Kommentar konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      await refetchComments()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kommentare</DialogTitle>
          <DialogDescription>{task?.title}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Noch keine Kommentare</p>
        ) : (
          <ScrollArea className="max-h-80 flex-1">
            <div className="space-y-4 pr-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-medium">
                        {comment.author_email ?? "Ehemaliges Mitglied"}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatTimestamp(comment.created_at)}
                      </span>
                    </div>
                    {comment.author_id === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                            <span className="sr-only">Kommentar-Menü</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingComment(comment)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(comment)}
                            className="text-destructive focus:text-destructive"
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingComment?.id === comment.id ? (
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-2">
                        <FormField
                          control={editForm.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={3} {...field} />
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
                            onClick={() => setEditingComment(null)}
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 border-t pt-4">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Kommentar schreiben…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || !taskId}>
              {isSubmitting ? "Wird gesendet…" : "Kommentieren"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
