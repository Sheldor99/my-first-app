"use client"

import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface TeamMemberProfile {
  id: string
  email: string
}

export function useTeamMembers(teamId: string | null) {
  const [members, setMembers] = useState<TeamMemberProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!teamId) {
      setMembers([])
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const supabase = createClient()

    async function load() {
      const { data: memberRows, error: memberError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId)

      if (memberError || !memberRows || !isMounted) {
        if (isMounted) setIsLoading(false)
        return
      }

      const userIds = memberRows.map((row) => row.user_id)
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)

      if (isMounted) {
        if (!profileError && profileRows) {
          setMembers(profileRows)
        }
        setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [teamId])

  return { members, isLoading }
}
