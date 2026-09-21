import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      // verifyOtp for type "signup" also establishes a session. That's
      // fine on its own, but it means the proxy's "already logged in"
      // redirect would bounce the user away from /login before they ever
      // see the confirmation message. Sign back out so the user actually
      // lands on the login page and logs in normally, as the spec expects.
      if (type === 'signup') {
        await supabase.auth.signOut()
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}
