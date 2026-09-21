"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import { projectSchema, type ProjectInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Project } from "@/components/projects/project-list"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  project?: Project | null
  onSaved: (project: Project) => void
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  teamId,
  project,
  onSaved,
}: ProjectFormDialogProps) {
  const isEditing = Boolean(project)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
      })
      setFormError(null)
    }
  }, [open, project, form])

  async function onSubmit(values: ProjectInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()

      if (isEditing && project) {
        const { data, error } = await supabase
          .from("projects")
          .update({ name: values.name, description: values.description || null })
          .eq("id", project.id)
          .select("id, team_id, name, description, created_by, created_at")
          .single()

        if (error || !data) {
          setFormError("Projekt konnte nicht gespeichert werden. Bitte versuche es erneut.")
          return
        }

        onSaved(data)
      } else {
        const { data: userData } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from("projects")
          .insert({
            team_id: teamId,
            name: values.name,
            description: values.description || null,
            created_by: userData.user?.id ?? null,
          })
          .select("id, team_id, name, description, created_by, created_at")
          .single()

        if (error || !data) {
          setFormError("Projekt konnte nicht erstellt werden. Bitte versuche es erneut.")
          return
        }

        onSaved(data)
      }

      onOpenChange(false)
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Projekt bearbeiten" : "Neues Projekt"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ändere Name oder Beschreibung des Projekts."
              : "Gib deinem neuen Projekt einen Namen."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Wird gespeichert…"
                  : isEditing
                    ? "Speichern"
                    : "Projekt erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
