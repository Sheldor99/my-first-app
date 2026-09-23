"use client"

import Link from "next/link"
import { LayoutDashboard } from "lucide-react"

import { useActiveTeam } from "@/components/layout/team-provider"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { formatDuration } from "@/lib/validations/time-entry"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { activeTeamId, isLoading: isTeamsLoading } = useActiveTeam()
  const { stats, isLoading: isStatsLoading } = useDashboardStats(activeTeamId)

  const isLoading = isTeamsLoading || isStatsLoading

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">← Zurück</Link>
        </Button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : stats.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Noch keine Projekte in diesem Team</p>
            <p className="text-sm text-muted-foreground">
              Lege ein Projekt an, um hier eine Übersicht zu sehen.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Zur Projektübersicht</Link>
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[65vh] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projekt</TableHead>
                <TableHead className="text-right">To Do</TableHead>
                <TableHead className="text-right">In Progress</TableHead>
                <TableHead className="text-right">Done</TableHead>
                <TableHead className="text-right">Überfällig</TableHead>
                <TableHead className="text-right">Gesamtzeit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((project) => (
                <TableRow key={project.project_id}>
                  <TableCell className="font-medium">{project.project_name}</TableCell>
                  <TableCell className="text-right">{project.todo_count}</TableCell>
                  <TableCell className="text-right">{project.in_progress_count}</TableCell>
                  <TableCell className="text-right">{project.done_count}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      project.overdue_count > 0 && "font-semibold text-destructive"
                    )}
                  >
                    {project.overdue_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDuration(project.total_minutes)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </main>
  )
}
