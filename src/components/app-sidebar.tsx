"use client"

import * as React from "react"
import {
  Calendar,
  Users,
  BarChart3,
  DollarSign,
  Zap,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Menu data for DayWin system
const getNavData = (onNavigate?: (page: string) => void) => ({
  navMain: [
    {
      title: "Lançamentos",
      url: "#",
      icon: Calendar,
      isActive: true,
      items: [
        {
          title: "Registrar Dia",
          url: "#",
          onClick: () => onNavigate?.('registrar-dia')
        },
        {
          title: "Histórico",
          url: "#",
          onClick: () => onNavigate?.('historico')
        },
        {
          title: "Pendências",
          url: "#",
          onClick: () => onNavigate?.('pendencias')
        },
      ],
    },
    {
      title: "Diaristas",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Cadastro",
          url: "#",
          onClick: () => onNavigate?.('cadastro-diarista')
        },
        {
          title: "Lista",
          url: "#",
          onClick: () => onNavigate?.('lista-diaristas')
        },
        {
          title: "Funções",
          url: "#",
          onClick: () => onNavigate?.('funcoes')
        },
      ],
    },
    {
      title: "Financeiro",
      url: "#",
      icon: DollarSign,
      items: [
        {
          title: "Bonificações",
          url: "#",
          onClick: () => onNavigate?.('bonificacoes')
        },
        {
          title: "Descontos",
          url: "#",
          onClick: () => onNavigate?.('descontos')
        },
        {
          title: "Taxa de Serviço",
          url: "#",
          onClick: () => onNavigate?.('taxa-servico')
        },
        {
          title: "Fechamentos",
          url: "#",
          onClick: () => onNavigate?.('fechamentos')
        },
      ],
    },
    {
      title: "Insights",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Relatórios",
          url: "#",
          onClick: () => onNavigate?.('relatorios')
        },
        {
          title: "Analytics",
          url: "#",
          onClick: () => onNavigate?.('analytics')
        },
        {
          title: "Performance",
          url: "#",
          onClick: () => onNavigate?.('performance')
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Regras & Distribuição",
          url: "#",
          onClick: () => onNavigate?.('regras')
        },
        {
          title: "Usuários & Papéis",
          url: "#",
          onClick: () => onNavigate?.('usuarios')
        },
        {
          title: "Backup & Restore",
          url: "#",
          onClick: () => onNavigate?.('backup')
        },
        {
          title: "Auditoria",
          url: "#",
          onClick: () => onNavigate?.('auditoria')
        },
      ],
    },
  ],
})

export function AppSidebar({ user, onLogout, currentPage, onNavigate, ...props }: React.ComponentProps<typeof Sidebar> & { user?: any; onLogout?: () => void; currentPage?: string; onNavigate?: (page: string) => void }) {
  const { open, state, isMobile } = useSidebar()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher onNavigate={onNavigate} />
        
        {/* Quick Launch Button */}
        <div className="p-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`${
                  open
                    ? "w-full flex items-center gap-2 px-3 py-2"
                    : "w-full flex items-center justify-center p-2"
                } text-sm font-medium bg-transparent rounded-lg transition-all duration-300 active:scale-95 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
                onClick={() => console.log("Lançamento Rápido")}
              >
                {open ? (
                  <>
                    <Zap className="h-4 w-4 transition-all duration-300" />
                    <span className="transition-opacity duration-300">Lançamento Rápido</span>
                  </>
                ) : (
                  <Zap className="h-4 w-4 transition-all duration-300 min-w-4 min-h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              hidden={state !== "collapsed" || isMobile}
            >
              Lançamento Rápido
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavData(onNavigate).navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user?.name || 'Usuário', email: user?.email || 'usuario@daywin.com' }} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
