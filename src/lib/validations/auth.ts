import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(10, 'Passwort muss mindestens 10 Zeichen lang sein')
  .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
  .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
  .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten')

export const loginSchema = z.object({
  email: z.string().min(1, 'E-Mail ist erforderlich').email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.string().min(1, 'E-Mail ist erforderlich').email('Ungültige E-Mail-Adresse'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Bitte bestätige dein Passwort'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-Mail ist erforderlich').email('Ungültige E-Mail-Adresse'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Bitte bestätige dein Passwort'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
