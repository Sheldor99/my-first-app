"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth"
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

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
      })

      if (error) {
        setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
        return
      }

      // Immer dieselbe Meldung, unabhängig davon ob die E-Mail existiert
      // (Enumeration-Schutz, siehe Feature-Spec).
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Alert>
        <AlertDescription>
          Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum
          Zurücksetzen des Passworts gesendet.
        </AlertDescription>
      </Alert>
    )
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Wird gesendet…" : "Reset-Link anfordern"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </form>
    </Form>
  )
}
