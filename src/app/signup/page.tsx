import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Registrieren",
}

export default function SignupPage() {
  return (
    <AuthCard title="Registrieren" description="Erstelle ein neues Konto">
      <SignupForm />
    </AuthCard>
  )
}
