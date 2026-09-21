import { describe, expect, it } from "vitest"
import { taskSchema } from "./task"

describe("taskSchema", () => {
  it("accepts a valid title with no other fields", () => {
    expect(taskSchema.safeParse({ title: "Design-Review durchführen" }).success).toBe(true)
  })

  it("accepts a title with description, assignee, and due date", () => {
    const result = taskSchema.safeParse({
      title: "Design-Review durchführen",
      description: "Feedback von Kunde einholen",
      assignee_id: "5b1f6f4a-9b0a-4a7a-8b1a-2f6b3c4d5e6f",
      due_date: "2026-10-01",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an empty title", () => {
    expect(taskSchema.safeParse({ title: "" }).success).toBe(false)
  })

  it("rejects a title longer than 200 characters", () => {
    expect(taskSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false)
  })

  it("accepts a title exactly 200 characters long", () => {
    expect(taskSchema.safeParse({ title: "a".repeat(200) }).success).toBe(true)
  })

  it("rejects a description longer than 1000 characters", () => {
    const result = taskSchema.safeParse({ title: "Valid", description: "b".repeat(1001) })
    expect(result.success).toBe(false)
  })

  it("accepts a description exactly 1000 characters long", () => {
    const result = taskSchema.safeParse({ title: "Valid", description: "b".repeat(1000) })
    expect(result.success).toBe(true)
  })

  it("rejects a non-UUID assignee_id", () => {
    expect(taskSchema.safeParse({ title: "Valid", assignee_id: "not-a-uuid" }).success).toBe(
      false
    )
  })

  it("accepts a null assignee_id (unassigned)", () => {
    expect(taskSchema.safeParse({ title: "Valid", assignee_id: null }).success).toBe(true)
  })
})
