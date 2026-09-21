import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team-Name ist erforderlich')
    .max(100, 'Team-Name darf maximal 100 Zeichen lang sein'),
})

export type TeamInput = z.infer<typeof teamSchema>
