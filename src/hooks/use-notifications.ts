"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export type NotificationType = "assignment" | "comment"

export interface Notification {
  id: string
  task_id: string | null
  task_title: string | null
  project_id: string | null
  actor_id: string | null
  actor_email: string | null
  type: NotificationType
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (!userId) {
      if (isMountedRef.current) {
        setNotifications([])
        setIsLoading(false)
      }
      return
    }

    const { data: notificationRows, error } = await supabase
      .from("notifications")
      .select("id, task_id, actor_id, type, is_read, created_at")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })

    if (error || !notificationRows) {
      if (isMountedRef.current) setIsLoading(false)
      return
    }

    const taskIds = Array.from(
      new Set(
        notificationRows.map((n) => n.task_id).filter((id): id is string => Boolean(id))
      )
    )
    const actorIds = Array.from(
      new Set(
        notificationRows.map((n) => n.actor_id).filter((id): id is string => Boolean(id))
      )
    )

    let taskInfoById = new Map<string, { title: string; project_id: string }>()
    if (taskIds.length > 0) {
      const { data: taskRows } = await supabase
        .from("tasks")
        .select("id, title, project_id")
        .in("id", taskIds)
      if (taskRows) {
        taskInfoById = new Map(
          taskRows.map((task) => [task.id, { title: task.title, project_id: task.project_id }])
        )
      }
    }

    let emailByActorId = new Map<string, string>()
    if (actorIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", actorIds)
      if (profileRows) {
        emailByActorId = new Map(profileRows.map((profile) => [profile.id, profile.email]))
      }
    }

    if (!isMountedRef.current) return

    setNotifications(
      notificationRows.map((n) => ({
        ...n,
        task_title: n.task_id ? taskInfoById.get(n.task_id)?.title ?? null : null,
        project_id: n.task_id ? taskInfoById.get(n.task_id)?.project_id ?? null : null,
        actor_email: n.actor_id ? emailByActorId.get(n.actor_id) ?? null : null,
      }))
    )
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )

    const supabase = createClient()
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

    if (error) {
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })))

    const supabase = createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds)

    if (error) {
      await fetchNotifications()
    }
  }, [notifications, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetchNotifications: fetchNotifications,
  }
}
