import { z } from 'zod'

export const MAX_DURATION_HOURS = 24

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export const timeEntrySchema = z.object({
  entry_date: z
    .string()
    .min(1, 'Datum ist erforderlich')
    .refine((value) => value <= todayIso(), 'Datum darf nicht in der Zukunft liegen'),
  hours: z
    .string()
    .min(1, 'Dauer ist erforderlich')
    .refine((value) => !Number.isNaN(Number(value)), 'Dauer muss eine Zahl sein')
    .refine((value) => Number(value) > 0, 'Dauer muss größer als 0 sein')
    .refine(
      (value) => Number(value) <= MAX_DURATION_HOURS,
      `Dauer darf maximal ${MAX_DURATION_HOURS} Stunden betragen`
    ),
  note: z
    .string()
    .max(500, 'Notiz darf maximal 500 Zeichen lang sein')
    .optional(),
})

export type TimeEntryInput = z.infer<typeof timeEntrySchema>

export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60)
}

export function minutesToHours(minutes: number): number {
  return minutes / 60
}

export function formatDuration(minutes: number): string {
  const hours = minutes / 60
  const formatted = hours.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${formatted} Std.`
}
