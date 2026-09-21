"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import { teamSchema, type TeamInput } from "@/lib/validations/team"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Team } from "@/hooks/use-teams"

interface CreateTeamFormProps {
  onCreated: (team: Team) => void
  submitLabel?: string
}

export function CreateTeamForm({ onCreated, submitLabel = "Team erstellen" }: CreateTeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<TeamInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "" },
  })

  async function onSubmit(values: TeamInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
        return
      }

      const { data, error } = await supabase
        .from("teams")
        .insert({ name: values.name, created_by: userData.user.id })
        .select("id, name, created_by, created_at")
        .single()

      if (error || !data) {
        setFormError("Team konnte nicht erstellt werden. Bitte versuche es erneut.")
        return
      }

      form.reset()
      onCreated(data)
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
              <FormLabel>Team-Name</FormLabel>
              <FormControl>
                <Input autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Wird erstellt…" : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
