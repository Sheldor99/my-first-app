"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setEmail(data.user?.email ?? null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      {isLoading ? (
        <Skeleton className="h-8 w-64" />
      ) : email ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">Eingeloggt als {email}</p>
          <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline">
            {isLoggingOut ? "Wird ausgeloggt…" : "Logout"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-muted-foreground">Du bist nicht eingeloggt.</p>
          <Button asChild>
            <Link href="/login">Zum Login</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
