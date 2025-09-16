import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings, Users, Shield, Database, FileText, Briefcase, Calendar, GitBranch } from 'lucide-react';

interface SettingsPopoverProps {
  onNavigate?: (page: string) => void;
}

export function SettingsPopover({ onNavigate }: SettingsPopoverProps) {
  const settingsItems = [
    {
      title: "Regras & Distribuição",
      icon: GitBranch,
      page: 'regras',
      description: "Configurar regras de distribuição"
    },
    {
      title: "Jornada",
      icon: Calendar,
      page: 'jornada',
      description: "Configurar jornada de trabalho"
    },
    {
      title: "Usuários & Papéis",
      icon: Users,
      page: 'usuarios',
      description: "Gerenciar usuários e permissões"
    },
    {
      title: "Backup & Restore",
      icon: Database,
      page: 'backup',
      description: "Backup e restauração de dados"
    },
    {
      title: "Auditoria",
      icon: Shield,
      page: 'auditoria',
      description: "Logs e auditoria do sistema"
    },
    {
      title: "Funções",
      icon: Briefcase,
      page: 'funcoes',
      description: "Configurar funções e cargos"
    },
    {
      title: "Fechamentos",
      icon: FileText,
      page: 'fechamentos',
      description: "Gerenciar fechamentos de período"
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Configurações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="text-sm font-medium">Configurações</div>
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate?.(item.page)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}