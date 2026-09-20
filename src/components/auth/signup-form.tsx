"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import { signupSchema, type SignupInput } from "@/lib/validations/auth"
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

export function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(values: SignupInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setFormError("Registrierung fehlgeschlagen. Bitte versuche es erneut.")
        return
      }

      // Immer dieselbe Erfolgsmeldung, unabhängig davon ob die E-Mail
      // bereits registriert ist (Enumeration-Schutz, siehe Feature-Spec).
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
          Falls diese E-Mail-Adresse noch nicht verwendet wird, wurde eine
          Bestätigungs-E-Mail gesendet. Bitte prüfe dein Postfach, um deinen
          Account zu aktivieren.
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Wird registriert…" : "Registrieren"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Einloggen
          </Link>
        </p>
      </form>
    </Form>
  )
}
