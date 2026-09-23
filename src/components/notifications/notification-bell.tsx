"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

import { useNotifications, type Notification } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function notificationText(notification: Notification) {
  const actor = notification.actor_email ?? "Ehemaliges Mitglied"
  const task = notification.task_title ?? "einer Aufgabe"

  if (notification.type === "assignment") {
    return `${actor} hat dir die Aufgabe „${task}" zugewiesen`
  }
  return `${actor} hat zu „${task}" kommentiert`
}

export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications()

  function handleClick(notification: Notification) {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Benachrichtigungen</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm font-medium">Benachrichtigungen</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
              Alle als gelesen markieren
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Keine Benachrichtigungen</p>
        ) : (
          <ScrollArea className="h-80">
            <div className="divide-y">
              {notifications.map((notification) => {
                const content = (
                  <div
                    className={`space-y-1 p-3 text-sm ${
                      notification.is_read ? "text-muted-foreground" : "font-medium"
                    }`}
                  >
                    <p>{notificationText(notification)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.created_at)}
                    </p>
                  </div>
                )

                return notification.project_id ? (
                  <Link
                    key={notification.id}
                    href={`/projects/${notification.project_id}`}
                    onClick={() => handleClick(notification)}
                    className="block hover:bg-muted/50"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleClick(notification)}
                    className="block w-full text-left hover:bg-muted/50"
                  >
                    {content}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
