import { describe, expect, it } from "vitest"
import { projectSchema } from "./project"

describe("projectSchema", () => {
  it("accepts a valid name with no description", () => {
    expect(projectSchema.safeParse({ name: "Website Relaunch" }).success).toBe(true)
  })

  it("accepts a valid name with a description", () => {
    const result = projectSchema.safeParse({
      name: "Website Relaunch",
      description: "Kundenprojekt für Acme GmbH",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an empty name", () => {
    expect(projectSchema.safeParse({ name: "" }).success).toBe(false)
  })

  it("rejects a name longer than 100 characters", () => {
    expect(projectSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false)
  })

  it("rejects a description longer than 500 characters", () => {
    const result = projectSchema.safeParse({
      name: "Valid",
      description: "b".repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it("accepts a description exactly 500 characters long", () => {
    const result = projectSchema.safeParse({
      name: "Valid",
      description: "b".repeat(500),
    })
    expect(result.success).toBe(true)
  })
})
