"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskList } from "@/components/tasks/task-list"

interface Project {
  id: string
  team_id: string
  name: string
  description: string | null
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    supabase
      .from("projects")
      .select("id, team_id, name, description")
      .eq("id", projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (isMounted) {
          setProject(data)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [projectId])

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : !project ? (
        <p className="text-muted-foreground">
          Projekt nicht gefunden oder kein Zugriff.
        </p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-muted-foreground">{project.description}</p>
            )}
          </div>

          <TaskList projectId={project.id} teamId={project.team_id} />
        </div>
      )}
    </div>
  )
}
