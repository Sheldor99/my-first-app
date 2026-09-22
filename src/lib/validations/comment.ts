import { z } from 'zod'

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Kommentar darf nicht leer sein')
    .max(2000, 'Kommentar darf maximal 2000 Zeichen lang sein'),
})

export type CommentInput = z.infer<typeof commentSchema>
