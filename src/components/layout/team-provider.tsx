"use client"

import { createContext, useContext } from "react"

import { useTeams, type Team } from "@/hooks/use-teams"

interface TeamContextValue {
  teams: Team[]
  activeTeamId: string | null
  setActiveTeamId: (teamId: string) => void
  isLoading: boolean
  refetchTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextValue | null>(null)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const value = useTeams()
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useActiveTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error("useActiveTeam must be used within a TeamProvider")
  }
  return context
}
