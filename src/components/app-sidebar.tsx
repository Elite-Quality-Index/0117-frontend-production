"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Database,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavRecents } from "@/components/nav-recent"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
    },
    {
      title: "Data",
      url: "#",
      icon: Database,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  recents: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
        <NavRecents recents={data.recents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
