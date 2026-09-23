"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface ProjectDashboardStats {
  project_id: string
  project_name: string
  todo_count: number
  in_progress_count: number
  done_count: number
  overdue_count: number
  total_minutes: number
}

export function useDashboardStats(teamId: string | null) {
  const [stats, setStats] = useState<ProjectDashboardStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchStats = useCallback(async () => {
    if (!teamId) {
      setStats([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc("get_team_dashboard_stats", {
      p_team_id: teamId,
    })

    if (!isMountedRef.current) return

    if (!error && data) {
      setStats(data)
    }
    setIsLoading(false)
  }, [teamId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, refetchStats: fetchStats }
}
