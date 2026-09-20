import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Neues Passwort setzen",
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Neues Passwort setzen" description="Wähle ein neues Passwort">
      <ResetPasswordForm />
    </AuthCard>
  )
}
