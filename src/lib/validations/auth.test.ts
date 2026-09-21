import { describe, expect, it } from "vitest"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth"

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "anything" })
    expect(result.success).toBe(true)
  })

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "x" })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" })
    expect(result.success).toBe(false)
  })

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("signupSchema password policy", () => {
  const base = { email: "a@b.com", confirmPassword: "StrongPass123" }

  it("accepts a password with 10+ chars, upper, lower, and a number", () => {
    const result = signupSchema.safeParse({ ...base, password: "StrongPass123" })
    expect(result.success).toBe(true)
  })

  it("rejects a password shorter than 10 characters", () => {
    const result = signupSchema.safeParse({
      ...base,
      password: "Short1",
      confirmPassword: "Short1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a password without an uppercase letter", () => {
    const result = signupSchema.safeParse({
      ...base,
      password: "lowercase123",
      confirmPassword: "lowercase123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a password without a lowercase letter", () => {
    const result = signupSchema.safeParse({
      ...base,
      password: "UPPERCASE123",
      confirmPassword: "UPPERCASE123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a password without a number", () => {
    const result = signupSchema.safeParse({
      ...base,
      password: "NoNumberHere",
      confirmPassword: "NoNumberHere",
    })
    expect(result.success).toBe(false)
  })

  it("rejects when password and confirmPassword don't match", () => {
    const result = signupSchema.safeParse({
      email: "a@b.com",
      password: "StrongPass123",
      confirmPassword: "DifferentPass123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"])
    }
  })
})

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true)
  })

  it("rejects an empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  it("accepts matching strong passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "StrongPass123",
      confirmPassword: "StrongPass123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "StrongPass123",
      confirmPassword: "OtherPass123",
    })
    expect(result.success).toBe(false)
  })
})
