import { z } from 'zod'

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Projektname ist erforderlich')
    .max(100, 'Projektname darf maximal 100 Zeichen lang sein'),
  description: z
    .string()
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
