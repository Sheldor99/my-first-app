"use client"

import { useEffect, useRef, useState } from "react"
import { Download, MoreVertical, Paperclip } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { useTaskAttachments, type TaskAttachment } from "@/hooks/use-task-attachments"
import { validateAttachmentFile, formatFileSize } from "@/lib/validations/attachment"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/components/tasks/task-board"

const BUCKET = "task-attachments"

interface TaskAttachmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  teamId: string
  onAttachmentsChanged: (taskId: string, count: number) => void
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

export function TaskAttachmentsDialog({
  open,
  onOpenChange,
  task,
  teamId,
  onAttachmentsChanged,
}: TaskAttachmentsDialogProps) {
  const taskId = task?.id ?? null
  const { attachments, isLoading, refetchAttachments } = useTaskAttachments(open ? taskId : null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [open])

  useEffect(() => {
    if (open && taskId && !isLoading) {
      onAttachmentsChanged(taskId, attachments.length)
    }
  }, [open, taskId, isLoading, attachments.length, onAttachmentsChanged])

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !taskId || !currentUserId) return

    const validationError = validateAttachmentFile(file)
    if (validationError) {
      toast.error(validationError.message)
      return
    }

    setIsUploading(true)
    const storagePath = `${teamId}/${taskId}/${crypto.randomUUID()}-${file.name}`

    try {
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file)

      if (uploadError) {
        toast.error("Datei konnte nicht hochgeladen werden. Bitte versuche es erneut.")
        return
      }

      const { error: insertError } = await supabase.from("task_attachments").insert({
        task_id: taskId,
        uploader_id: currentUserId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
      })

      if (insertError) {
        await supabase.storage.from(BUCKET).remove([storagePath])
        toast.error("Datei konnte nicht gespeichert werden. Bitte versuche es erneut.")
        return
      }

      await refetchAttachments()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDownload(attachment: TaskAttachment) {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(attachment.storage_path, 60)

    if (error || !data) {
      toast.error("Download-Link konnte nicht erstellt werden. Bitte versuche es erneut.")
      return
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer")
  }

  async function handleDelete(attachment: TaskAttachment) {
    setDeletingId(attachment.id)

    try {
      const supabase = createClient()
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([attachment.storage_path])

      if (storageError) {
        toast.error("Anhang konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      const { error: dbError } = await supabase
        .from("task_attachments")
        .delete()
        .eq("id", attachment.id)

      if (dbError) {
        toast.error("Anhang konnte nicht gelöscht werden. Bitte versuche es erneut.")
        return
      }

      await refetchAttachments()
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Anhänge</DialogTitle>
          <DialogDescription>{task?.title}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : attachments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Noch keine Anhänge</p>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3 pr-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment)}
                        className="truncate text-left text-sm font-medium hover:underline"
                      >
                        {attachment.file_name}
                      </button>
                      <div className="text-xs text-muted-foreground">
                        {attachment.uploader_email ?? "Ehemaliges Mitglied"} ·{" "}
                        {formatFileSize(attachment.file_size)} ·{" "}
                        {formatTimestamp(attachment.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Herunterladen</span>
                    </Button>
                    {attachment.uploader_id === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={deletingId === attachment.id}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                            <span className="sr-only">Anhang-Menü</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(attachment)}
                            className="text-destructive focus:text-destructive"
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t pt-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading || !taskId}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? "Wird hochgeladen…" : "Datei hochladen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
