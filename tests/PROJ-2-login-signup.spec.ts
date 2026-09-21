import { test, expect } from "@playwright/test"

// These tests avoid triggering real Supabase signup/reset-email calls
// (shared project has a strict email-send rate limit) and avoid depending
// on a pre-existing confirmed account. They cover the acceptance criteria
// that are reachable through client-side validation, generic error
// messages, and route protection alone.

test.describe("PROJ-2: Route protection", () => {
  test("unauthenticated visitor is redirected from / to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe("PROJ-2: Signup validation", () => {
  test("empty form shows a validation error per required field", async ({ page }) => {
    await page.goto("/signup")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByText("E-Mail ist erforderlich")).toBeVisible()
    await expect(page.getByText("Passwort muss mindestens 10 Zeichen lang sein")).toBeVisible()
    await expect(page.getByText("Bitte bestätige dein Passwort")).toBeVisible()
  })

  test("password shorter than 10 characters is rejected", async ({ page }) => {
    await page.goto("/signup")
    await page.locator('input[type="email"]').fill("test@example.com")
    await page.locator('input[type="password"]').first().fill("Short1")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByText("Passwort muss mindestens 10 Zeichen lang sein")).toBeVisible()
  })

  test("password without a number is rejected", async ({ page }) => {
    await page.goto("/signup")
    await page.locator('input[type="email"]').fill("test@example.com")
    await page.locator('input[type="password"]').first().fill("NoNumberHere")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByText("Passwort muss mindestens eine Zahl enthalten")).toBeVisible()
  })

  test("mismatched password and confirmation is rejected", async ({ page }) => {
    await page.goto("/signup")
    await page.locator('input[type="email"]').fill("test@example.com")
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.nth(0).fill("StrongPass123")
    await passwordInputs.nth(1).fill("DifferentPass123")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByText("Passwörter stimmen nicht überein")).toBeVisible()
  })
})

test.describe("PROJ-2: Login", () => {
  test("empty form shows a validation error per required field", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Einloggen" }).click()
    await expect(page.getByText("E-Mail ist erforderlich")).toBeVisible()
    await expect(page.getByText("Passwort ist erforderlich")).toBeVisible()
  })

  test("wrong credentials show a generic error message", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[type="email"]').fill("does-not-exist@proj2-qa-test.dev")
    await page.locator('input[type="password"]').fill("WrongPassword123")
    await page.getByRole("button", { name: "Einloggen" }).click()
    await expect(page.getByText("E-Mail oder Passwort ist falsch")).toBeVisible()
  })
})

test.describe("PROJ-2: Reset password", () => {
  test("visiting reset-password without a session shows the expired-link state", async ({
    page,
  }) => {
    await page.goto("/reset-password")
    await expect(
      page.getByText("Dieser Link ist abgelaufen oder wurde bereits verwendet.")
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Neuen Reset-Link anfordern" })).toBeVisible()
  })
})

test.describe("PROJ-2: Auth confirm route", () => {
  test("an invalid token redirects to /login with an error message", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=invalid&type=signup&next=/login")
    await expect(page).toHaveURL(/\/login\?error=invalid_link$/)
    await expect(page.getByText("Dieser Link ist ungültig oder abgelaufen.")).toBeVisible()
  })
})
