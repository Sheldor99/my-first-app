"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import { addTeamMemberSchema, type AddTeamMemberInput } from "@/lib/validations/team"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

interface AddMemberFormProps {
  teamId: string
  onAdded: () => void
}

type AddMemberResult = "not_found" | "already_member" | "added"

export function AddMemberForm({ teamId, onAdded }: AddMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<AddTeamMemberInput>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: AddTeamMemberInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("add_team_member_by_email", {
        target_team_id: teamId,
        member_email: values.email,
      })

      if (error) {
        setFormError("Mitglied konnte nicht hinzugefügt werden. Bitte versuche es erneut.")
        return
      }

      const result = data as AddMemberResult

      if (result === "not_found") {
        setFormError("Diese Person muss sich zuerst registrieren.")
        return
      }

      if (result === "already_member") {
        setFormError("Diese Person ist bereits Mitglied.")
        return
      }

      form.reset()
      onAdded()
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="person@firma.de" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird hinzugefügt…" : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
