import { describe, expect, it } from "vitest"
import { addTeamMemberSchema, teamSchema } from "./team"

describe("teamSchema", () => {
  it("accepts a valid team name", () => {
    expect(teamSchema.safeParse({ name: "Acme Agentur" }).success).toBe(true)
  })

  it("rejects an empty name", () => {
    expect(teamSchema.safeParse({ name: "" }).success).toBe(false)
  })

  it("rejects a name longer than 100 characters", () => {
    expect(teamSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false)
  })

  it("accepts a name exactly 100 characters long", () => {
    expect(teamSchema.safeParse({ name: "a".repeat(100) }).success).toBe(true)
  })
})

describe("addTeamMemberSchema", () => {
  it("accepts a valid email", () => {
    expect(addTeamMemberSchema.safeParse({ email: "person@example.com" }).success).toBe(true)
  })

  it("rejects an empty email", () => {
    expect(addTeamMemberSchema.safeParse({ email: "" }).success).toBe(false)
  })

  it("rejects an invalid email format", () => {
    expect(addTeamMemberSchema.safeParse({ email: "not-an-email" }).success).toBe(false)
  })
})
