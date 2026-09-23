import { describe, expect, it } from "vitest"
import { notificationText } from "./notification-bell"
import type { Notification } from "@/hooks/use-notifications"

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "1",
    task_id: "task-1",
    task_title: "Design überarbeiten",
    project_id: "project-1",
    actor_id: "actor-1",
    actor_email: "actor@example.com",
    type: "assignment",
    is_read: false,
    created_at: "2026-09-23T10:00:00.000Z",
    ...overrides,
  }
}

describe("notificationText", () => {
  it("formats an assignment notification", () => {
    const text = notificationText(makeNotification({ type: "assignment" }))
    expect(text).toBe('actor@example.com hat dir die Aufgabe „Design überarbeiten" zugewiesen')
  })

  it("formats a comment notification", () => {
    const text = notificationText(makeNotification({ type: "comment" }))
    expect(text).toBe('actor@example.com hat zu „Design überarbeiten" kommentiert')
  })

  it("falls back to 'Ehemaliges Mitglied' when the actor has no email", () => {
    const text = notificationText(makeNotification({ actor_email: null }))
    expect(text).toContain("Ehemaliges Mitglied")
  })

  it("falls back to a generic task reference when the task title is missing", () => {
    const text = notificationText(makeNotification({ task_title: null }))
    expect(text).toContain("einer Aufgabe")
  })
})
