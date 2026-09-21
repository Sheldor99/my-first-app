import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team-Name ist erforderlich')
    .max(100, 'Team-Name darf maximal 100 Zeichen lang sein'),
})

export type TeamInput = z.infer<typeof teamSchema>

export const addTeamMemberSchema = z.object({
  email: z.string().min(1, 'E-Mail ist erforderlich').email('Ungültige E-Mail-Adresse'),
})

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>
