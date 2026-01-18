"use client"

import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  BookOpen,
  Bot,
  ChartLine,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSessions } from "@/components/nav-recent"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useChat } from "@/hooks/use-chat"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const {
    sessions,
    sessionsLoading,
    currentSessionId,
    handleSelectSession,
    handleNewSession,
    handleDeleteSession,
    clearCurrentSession,
  } = useChat()

  // Clear session selection when navigating away from cloud-chat
  React.useEffect(() => {
    if (!location.pathname.startsWith("/cloud-chat")) {
      clearCurrentSession()
    }
  }, [location.pathname, clearCurrentSession])

  const navMain = [
    {
      title: "About EQx",
      url: "/about",
      icon: BookOpen,
      items: [
        {
          title: "The Index",
          url: "/about/index",
        },
        {
          title: "The Foundation",
          url: "/about/foundation",
        },
      ],
    },
    {
      title: "Cloud Chat",
      url: "/cloud-chat",
      icon: Bot,
      onClick: clearCurrentSession,
    },
    {
      title: "Data Visuals",
      url: "/data-visuals",
      icon: ChartLine,
    },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  const onSelectSession = (sessionId: string) => {
    handleSelectSession(sessionId)
    navigate("/cloud-chat")
  }

  const onNewSession = () => {
    handleNewSession()
    navigate("/cloud-chat")
  }

  // Derive user display data from Firebase user
  const userDisplayData = user
    ? {
        name: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.photoURL || "",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "",
      }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-6 items-start transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
        <img
          src="/eqx-logo1.png"
          alt="EQx Logo"
          className="h-10 w-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {user && (
          <NavSessions
            sessions={sessions}
            sessionsLoading={sessionsLoading}
            currentSessionId={currentSessionId}
            onSelectSession={onSelectSession}
            onNewSession={onNewSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userDisplayData} isLoggedIn={!!user} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
