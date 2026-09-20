import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login",
}

export default function LoginPage() {
  return (
    <AuthCard title="Einloggen" description="Melde dich mit deinem Konto an">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
