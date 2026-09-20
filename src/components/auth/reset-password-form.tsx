"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase/client"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function ResetPasswordForm() {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setHasValidSession(Boolean(data.session))
        setIsCheckingSession(false)
      }
    }

    checkSession()
    return () => {
      isMounted = false
    }
  }, [])

  async function onSubmit(values: ResetPasswordInput) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        setFormError("Passwort konnte nicht aktualisiert werden. Bitte versuche es erneut.")
        return
      }

      setIsSubmitted(true)
      window.location.href = "/login"
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!hasValidSession && !isSubmitted) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <p>Dieser Link ist abgelaufen oder wurde bereits verwendet.</p>
          <Link href="/forgot-password" className="text-sm underline">
            Neuen Reset-Link anfordern
          </Link>
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neues Passwort</FormLabel>
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
          {isSubmitting ? "Wird gespeichert…" : "Passwort setzen"}
        </Button>
      </form>
    </Form>
  )
}
