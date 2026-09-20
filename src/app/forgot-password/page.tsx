import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Passwort vergessen",
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Passwort vergessen"
      description="Wir senden dir einen Link zum Zurücksetzen"
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
