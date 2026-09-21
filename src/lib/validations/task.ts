import { z } from 'zod'

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Titel ist erforderlich')
    .max(200, 'Titel darf maximal 200 Zeichen lang sein'),
  description: z
    .string()
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
})

export type TaskInput = z.infer<typeof taskSchema>
