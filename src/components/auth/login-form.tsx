"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
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

export function LoginForm() {
  const searchParams = useSearchParams()
  const justConfirmed = searchParams.get("confirmed") === "true"
  const invalidLink = searchParams.get("error") === "invalid_link"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true)
    setFormError(null)
    setUnconfirmedEmail(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setUnconfirmedEmail(values.email)
        } else {
          setFormError("E-Mail oder Passwort ist falsch")
        }
        return
      }

      if (!data.session) {
        setFormError("E-Mail oder Passwort ist falsch")
        return
      }

      window.location.href = "/"
    } catch (err) {
      console.error(err)
      setFormError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function resendConfirmation() {
    if (!unconfirmedEmail) return
    setIsResending(true)

    try {
      const confirmUrl = new URL("/auth/confirm", window.location.origin)
      confirmUrl.searchParams.set("next", "/login?confirmed=true")

      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
        options: { emailRedirectTo: confirmUrl.toString() },
      })

      if (error) {
        toast.error("Bestätigungs-E-Mail konnte nicht gesendet werden.")
      } else {
        toast.success("Bestätigungs-E-Mail wurde erneut gesendet.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {justConfirmed && (
          <Alert>
            <AlertDescription>
              E-Mail bestätigt. Du kannst dich jetzt einloggen.
            </AlertDescription>
          </Alert>
        )}

        {invalidLink && (
          <Alert variant="destructive">
            <AlertDescription>
              Dieser Link ist ungültig oder abgelaufen.
            </AlertDescription>
          </Alert>
        )}

        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {unconfirmedEmail && (
          <Alert variant="destructive">
            <AlertDescription className="space-y-2">
              <p>Bitte bestätige zuerst deine E-Mail-Adresse.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resendConfirmation}
                disabled={isResending}
              >
                {isResending ? "Wird gesendet…" : "Bestätigungs-E-Mail erneut senden"}
              </Button>
            </AlertDescription>
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
              <div className="flex items-center justify-between">
                <FormLabel>Passwort</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Wird eingeloggt…" : "Einloggen"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link href="/signup" className="text-foreground hover:underline">
            Registrieren
          </Link>
        </p>
      </form>
    </Form>
  )
}
