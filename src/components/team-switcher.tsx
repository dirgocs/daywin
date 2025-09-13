"use client"

import { Calendar } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const handleDashboardClick = () => {
    onNavigate?.('dashboard');
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors bg-gray-200 dark:bg-gray-700"
          onClick={handleDashboardClick}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Calendar className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">DayWin</span>
            <span className="truncate text-xs">Gestão de Diaristas</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}