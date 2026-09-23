import { describe, expect, it } from "vitest"
import {
  timeEntrySchema,
  hoursToMinutes,
  minutesToHours,
  formatDuration,
  MAX_DURATION_HOURS,
} from "./time-entry"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayIso() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function tomorrowIso() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

describe("timeEntrySchema", () => {
  it("accepts a valid entry", () => {
    const result = timeEntrySchema.safeParse({
      entry_date: yesterdayIso(),
      hours: "1.5",
      note: "Recherche",
    })
    expect(result.success).toBe(true)
  })

  it("accepts today's date", () => {
    expect(timeEntrySchema.safeParse({ entry_date: todayIso(), hours: "1" }).success).toBe(true)
  })

  it("accepts an entry without a note", () => {
    expect(timeEntrySchema.safeParse({ entry_date: todayIso(), hours: "2" }).success).toBe(true)
  })

  it("rejects an empty date", () => {
    expect(timeEntrySchema.safeParse({ entry_date: "", hours: "1" }).success).toBe(false)
  })

  it("rejects a future date", () => {
    expect(timeEntrySchema.safeParse({ entry_date: tomorrowIso(), hours: "1" }).success).toBe(
      false
    )
  })

  it("rejects an empty duration", () => {
    expect(timeEntrySchema.safeParse({ entry_date: todayIso(), hours: "" }).success).toBe(false)
  })

  it("rejects a non-numeric duration", () => {
    expect(timeEntrySchema.safeParse({ entry_date: todayIso(), hours: "abc" }).success).toBe(
      false
    )
  })

  it("rejects a zero duration", () => {
    expect(timeEntrySchema.safeParse({ entry_date: todayIso(), hours: "0" }).success).toBe(false)
  })

  it("rejects a negative duration", () => {
    expect(timeEntrySchema.safeParse({ entry_date: todayIso(), hours: "-1" }).success).toBe(false)
  })

  it("accepts a duration exactly at the maximum", () => {
    expect(
      timeEntrySchema.safeParse({ entry_date: todayIso(), hours: String(MAX_DURATION_HOURS) })
        .success
    ).toBe(true)
  })

  it("rejects a duration exceeding the maximum", () => {
    expect(
      timeEntrySchema.safeParse({ entry_date: todayIso(), hours: String(MAX_DURATION_HOURS + 1) })
        .success
    ).toBe(false)
  })

  it("rejects a note longer than 500 characters", () => {
    const result = timeEntrySchema.safeParse({
      entry_date: todayIso(),
      hours: "1",
      note: "a".repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it("accepts a note exactly 500 characters long", () => {
    const result = timeEntrySchema.safeParse({
      entry_date: todayIso(),
      hours: "1",
      note: "a".repeat(500),
    })
    expect(result.success).toBe(true)
  })
})

describe("hoursToMinutes / minutesToHours", () => {
  it("converts hours to minutes", () => {
    expect(hoursToMinutes(1.5)).toBe(90)
    expect(hoursToMinutes(1)).toBe(60)
  })

  it("rounds fractional minutes", () => {
    expect(hoursToMinutes(0.1)).toBe(6)
    expect(hoursToMinutes(1 / 3)).toBe(20)
  })

  it("converts minutes back to hours", () => {
    expect(minutesToHours(90)).toBe(1.5)
    expect(minutesToHours(60)).toBe(1)
  })
})

describe("formatDuration", () => {
  it("formats whole hours without decimals", () => {
    expect(formatDuration(60)).toBe("1 Std.")
  })

  it("formats fractional hours with a German decimal comma", () => {
    expect(formatDuration(90)).toBe("1,5 Std.")
  })

  it("formats less than an hour", () => {
    expect(formatDuration(30)).toBe("0,5 Std.")
  })
})
