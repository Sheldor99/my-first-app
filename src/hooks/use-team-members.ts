"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export type TeamMemberRole = "owner" | "member"

export interface TeamMemberProfile {
  id: string
  email: string
  role: TeamMemberRole
}

export function useTeamMembers(teamId: string | null) {
  const [members, setMembers] = useState<TeamMemberProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    if (!teamId) {
      setMembers([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: memberRows, error: memberError } = await supabase
      .from("team_members")
      .select("user_id, role")
      .eq("team_id", teamId)

    if (memberError || !memberRows) {
      if (isMountedRef.current) setIsLoading(false)
      return
    }

    const userIds = memberRows.map((row) => row.user_id)
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds)

    if (!isMountedRef.current) return

    if (!profileError && profileRows) {
      const roleByUserId = new Map(memberRows.map((row) => [row.user_id, row.role]))
      setMembers(
        profileRows.map((profile) => ({
          id: profile.id,
          email: profile.email,
          role: (roleByUserId.get(profile.id) ?? "member") as TeamMemberRole,
        }))
      )
    }
    setIsLoading(false)
  }, [teamId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return { members, isLoading, refetchMembers: fetchMembers }
}
