"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface TaskAttachment {
  id: string
  task_id: string
  uploader_id: string | null
  uploader_email: string | null
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  created_at: string
}

export function useTaskAttachments(taskId: string | null) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchAttachments = useCallback(async () => {
    if (!taskId) {
      setAttachments([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: attachmentRows, error: attachmentError } = await supabase
      .from("task_attachments")
      .select("id, task_id, uploader_id, file_name, file_size, mime_type, storage_path, created_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (attachmentError || !attachmentRows) {
      if (isMountedRef.current) setIsLoading(false)
      return
    }

    const uploaderIds = Array.from(
      new Set(
        attachmentRows
          .map((attachment) => attachment.uploader_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    let emailByUploaderId = new Map<string, string>()
    if (uploaderIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", uploaderIds)

      if (profileRows) {
        emailByUploaderId = new Map(profileRows.map((profile) => [profile.id, profile.email]))
      }
    }

    if (!isMountedRef.current) return

    setAttachments(
      attachmentRows.map((attachment) => ({
        ...attachment,
        uploader_email: attachment.uploader_id
          ? emailByUploaderId.get(attachment.uploader_id) ?? null
          : null,
      }))
    )
    setIsLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  return { attachments, isLoading, refetchAttachments: fetchAttachments }
}
