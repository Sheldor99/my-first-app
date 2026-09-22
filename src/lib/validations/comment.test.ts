import { describe, expect, it } from "vitest"
import { commentSchema } from "./comment"

describe("commentSchema", () => {
  it("accepts a valid comment", () => {
    expect(commentSchema.safeParse({ body: "Sieht gut aus!" }).success).toBe(true)
  })

  it("rejects an empty comment", () => {
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false)
  })

  it("rejects a whitespace-only comment", () => {
    expect(commentSchema.safeParse({ body: "    " }).success).toBe(false)
  })

  it("trims surrounding whitespace", () => {
    const result = commentSchema.safeParse({ body: "  Hallo  " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.body).toBe("Hallo")
    }
  })

  it("rejects a comment longer than 2000 characters", () => {
    expect(commentSchema.safeParse({ body: "a".repeat(2001) }).success).toBe(false)
  })

  it("accepts a comment exactly 2000 characters long", () => {
    expect(commentSchema.safeParse({ body: "a".repeat(2000) }).success).toBe(true)
  })
})
