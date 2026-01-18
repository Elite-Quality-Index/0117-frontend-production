"use client"

import {
  MessageCircle,
  Trash2,
  Plus,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Session } from "@/lib/api"

interface NavSessionsProps {
  sessions: Session[]
  sessionsLoading?: boolean
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
}

export function NavSessions({
  sessions,
  sessionsLoading,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: NavSessionsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Recents</span>
        <button
          onClick={onNewSession}
          className="hover:bg-sidebar-accent rounded p-0.5 transition-colors"
        >
          <Plus className="size-4" />
          <span className="sr-only">New Chat</span>
        </button>
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-center text-sm text-muted-foreground">
            {sessionsLoading ? "Fetching history sessions..." : "No conversations yet"}
          </p>
        ) : (
          sessions.map((session) => (
            <SidebarMenuItem key={session.session_id}>
              <SidebarMenuButton
                size="lg"
                isActive={currentSessionId === session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                tooltip={session.title}
              >
                <MessageCircle className="size-4 shrink-0" />
                <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                  <span className="truncate text-sm">
                    {session.title}
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/60">
                    {formatDate(session.updated_at)}
                  </span>
                </div>
              </SidebarMenuButton>
              <SidebarMenuAction
                showOnHover
                className="right-2 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteSession(session.session_id)
                }}
              >
                <Trash2 className="size-4 hover:text-destructive" />
                <span className="sr-only">Delete</span>
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
