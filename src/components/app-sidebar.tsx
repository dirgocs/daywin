import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Menu data for DayWin system
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      items: [
        {
          title: "Visão Geral",
          url: "#",
          isActive: true,
        },
        {
          title: "Relatórios",
          url: "#",
        },
      ],
    },
    {
      title: "Diaristas",
      url: "#",
      items: [
        {
          title: "Cadastro",
          url: "#",
        },
        {
          title: "Lista",
          url: "#",
        },
        {
          title: "Funções",
          url: "#",
        },
      ],
    },
    {
      title: "Dias Trabalhados",
      url: "#",
      items: [
        {
          title: "Registrar Dia",
          url: "#",
        },
        {
          title: "Histórico",
          url: "#",
        },
        {
          title: "Pendências",
          url: "#",
        },
      ],
    },
    {
      title: "Financeiro",
      url: "#",
      items: [
        {
          title: "Bonificações",
          url: "#",
        },
        {
          title: "Descontos",
          url: "#",
        },
        {
          title: "Taxa de Serviço",
          url: "#",
        },
        {
          title: "Fechamentos",
          url: "#",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      items: [
        {
          title: "Usuários",
          url: "#",
        },
        {
          title: "Permissões",
          url: "#",
        },
        {
          title: "Sistema",
          url: "#",
        },
        {
          title: "Backup",
          url: "#",
        },
      ],
    },
  ],
}

import { Button } from "@/components/ui/button"

export function AppSidebar({ user, onLogout, ...props }: React.ComponentProps<typeof Sidebar> & { user?: any; onLogout?: () => void }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      {/* User info and logout in footer */}
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{user?.name || 'Usuário'}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs"
          >
            Sair
          </Button>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
