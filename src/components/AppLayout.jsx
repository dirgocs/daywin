import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SettingsPopover } from '@/components/settings-popover';

const getPageTitle = (currentPage) => {
  const pageTitles = {
    'dashboard': 'Dashboard',
    'registrar-dia': 'Dia Trabalhado',
    'historico': 'Histórico de Pagamentos',
    'cadastro-diarista': 'Cadastro de Diarista',
    'lista-diaristas': 'Lista de Diaristas',
    'funcoes': 'Funções e Cargos',
    'bonificacoes': 'Bonificações',
    'descontos': 'Descontos',
    'taxa-servico': 'Taxa de Serviço',
    'diarias-a-pagar': 'Diárias a Pagar',
    'fechamentos': 'Fechamentos',
    'relatorios': 'Relatórios',
    'analytics': 'Analytics',
    'performance': 'Performance',
    'regras': 'Regras e Distribuição',
    'jornada': 'Jornada',
    'usuarios': 'Usuários e Papéis',
    'backup': 'Backup e Restore',
    'auditoria': 'Auditoria'
  };
  return pageTitles[currentPage] || 'Página';
};

const AppLayout = ({ children, user, onLogout, currentPage, onNavigate }) => {
  return (
    <SidebarProvider>
        <AppSidebar user={user} onLogout={onLogout} currentPage={currentPage} onNavigate={onNavigate} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4 opacity-0"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" onClick={() => onNavigate('dashboard')}>
                    Página Inicial
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {getPageTitle(currentPage)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <SettingsPopover onNavigate={onNavigate} />
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;