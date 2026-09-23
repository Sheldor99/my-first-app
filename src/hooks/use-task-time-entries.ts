"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface TaskTimeEntry {
  id: string
  task_id: string
  user_id: string | null
  user_email: string | null
  entry_date: string
  duration_minutes: number
  note: string | null
  created_at: string
}

export function useTaskTimeEntries(taskId: string | null) {
  const [entries, setEntries] = useState<TaskTimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchEntries = useCallback(async () => {
    if (!taskId) {
      setEntries([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: entryRows, error: entryError } = await supabase
      .from("task_time_entries")
      .select("id, task_id, user_id, entry_date, duration_minutes, note, created_at")
      .eq("task_id", taskId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (entryError || !entryRows) {
      if (isMountedRef.current) setIsLoading(false)
      return
    }

    const userIds = Array.from(
      new Set(
        entryRows
          .map((entry) => entry.user_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    let emailByUserId = new Map<string, string>()
    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)

      if (profileRows) {
        emailByUserId = new Map(profileRows.map((profile) => [profile.id, profile.email]))
      }
    }

    if (!isMountedRef.current) return

    setEntries(
      entryRows.map((entry) => ({
        ...entry,
        user_email: entry.user_id ? emailByUserId.get(entry.user_id) ?? null : null,
      }))
    )
    setIsLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return { entries, isLoading, refetchEntries: fetchEntries }
}
