"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface TaskComment {
  id: string
  task_id: string
  author_id: string | null
  author_email: string | null
  body: string
  created_at: string
  updated_at: string
}

export function useTaskComments(taskId: string | null) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchComments = useCallback(async () => {
    if (!taskId) {
      setComments([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: commentRows, error: commentError } = await supabase
      .from("task_comments")
      .select("id, task_id, author_id, body, created_at, updated_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (commentError || !commentRows) {
      if (isMountedRef.current) setIsLoading(false)
      return
    }

    const authorIds = Array.from(
      new Set(
        commentRows
          .map((comment) => comment.author_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    let emailByAuthorId = new Map<string, string>()
    if (authorIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", authorIds)

      if (profileRows) {
        emailByAuthorId = new Map(profileRows.map((profile) => [profile.id, profile.email]))
      }
    }

    if (!isMountedRef.current) return

    setComments(
      commentRows.map((comment) => ({
        ...comment,
        author_email: comment.author_id ? emailByAuthorId.get(comment.author_id) ?? null : null,
      }))
    )
    setIsLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { comments, isLoading, refetchComments: fetchComments }
}
