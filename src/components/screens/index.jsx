// Remaining skeleton screens for Daywin
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, BarChart, Zap, FileText, Settings, Database, Shield, Users, Calendar, TrendingUp, Search, Download, Cog, Key } from 'lucide-react';

// Fechamentos Screen
export const Fechamentos = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Fechamentos</h1>
      <p className="text-muted-foreground">Gerencie períodos e fechamentos para cálculo de pagamentos.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Controle de Fechamentos
        </CardTitle>
        <CardDescription>Esta tela permitirá:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Gestão de Períodos
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Criar períodos (diário, semanal, quinzenal, mensal, custom)</li>
              <li>• Configurar âncoras e frequências</li>
              <li>• Visualizar períodos abertos/fechados</li>
              <li>• Validar sobreposições</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Processo de Fechamento
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Prévia detalhada de cálculos</li>
              <li>• Fechamento definitivo e travamento</li>
              <li>• Exportação CSV/XLSX</li>
              <li>• Geração de espelhos individuais</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Relatórios Screen
export const Relatorios = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
      <p className="text-muted-foreground">Gere relatórios detalhados sobre trabalho e pagamentos.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios Disponíveis
        </CardTitle>
        <CardDescription>Esta tela incluirá:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filtros e Seleção
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Relatórios por período específico</li>
              <li>• Filtros por diarista individual</li>
              <li>• Agrupamento por função</li>
              <li>• Comparativos entre períodos</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportação
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Formato CSV para planilhas</li>
              <li>• Formato XLSX com formatação</li>
              <li>• Relatórios sintéticos e analíticos</li>
              <li>• Prévia antes da exportação</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Analytics Screen
export const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="text-muted-foreground">Análises e insights sobre produtividade e custos.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Análises Disponíveis
        </CardTitle>
        <CardDescription>Esta tela oferecerá:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendências e Comparativos
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Gráficos de evolução mensal</li>
              <li>• Comparação ano sobre ano</li>
              <li>• Tendências de custos</li>
              <li>• Sazonalidade de trabalho</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Métricas Avançadas
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• ROI por diarista</li>
              <li>• Produtividade por função</li>
              <li>• Distribuição de taxa de serviço</li>
              <li>• Indicadores de eficiência</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Performance Screen
export const Performance = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
      <p className="text-muted-foreground">Acompanhe indicadores de performance dos diaristas.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Métricas de Performance
        </CardTitle>
        <CardDescription>Esta tela mostrará:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Rankings e Classificações
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ranking por horas trabalhadas</li>
              <li>• Top performers do mês</li>
              <li>• Consistência de trabalho</li>
              <li>• Pontualidade e frequência</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Indicadores Individuais
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Produtividade por diarista</li>
              <li>• Evolução mensal individual</li>
              <li>• Comparação com médias</li>
              <li>• Metas e objetivos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Regras Screen
export const Regras = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Regras e Distribuição</h1>
      <p className="text-muted-foreground">Configure as regras de cálculo e distribuição de valores.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Cálculo
        </CardTitle>
        <CardDescription>Esta tela permitirá configurar:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Regras de Distribuição
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Modo: pontos×horas, apenas horas ou fixo</li>
              <li>• Percentual da taxa para diaristas</li>
              <li>• Horas mínimas para elegibilidade</li>
              <li>• Arredondamento em cinquentavos</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Configurações de Período
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Frequência de fechamentos</li>
              <li>• Âncoras de período (calendário/rolling)</li>
              <li>• Validações de sobreposição</li>
              <li>• Regras de reabertura</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Usuários Screen
export const Usuarios = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Usuários e Papéis</h1>
      <p className="text-muted-foreground">Gerencie usuários do sistema e suas permissões (RBAC).</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Controle de Acesso
        </CardTitle>
        <CardDescription>Esta tela gerenciará:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestão de Usuários
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Criar novos usuários</li>
              <li>• Definir login e senhas</li>
              <li>• Ativar/desativar contas</li>
              <li>• Histórico de acessos</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Papéis e Permissões
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Definir papéis (Gerente, Supervisor, etc.)</li>
              <li>• Configurar permissões granulares</li>
              <li>• Associar usuários a papéis</li>
              <li>• Clonar e personalizar papéis</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Backup Screen
export const Backup = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Backup e Restore</h1>
      <p className="text-muted-foreground">Faça backup e restaure dados do sistema.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Backup
        </CardTitle>
        <CardDescription>Esta tela oferecerá:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportação de Dados
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Backup completo do banco PGlite</li>
              <li>• Seleção de dados específicos</li>
              <li>• Validação de integridade</li>
              <li>• Compressão automática</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Restauração
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Importar backups salvos</li>
              <li>• Verificação de compatibilidade</li>
              <li>• Restauração seletiva</li>
              <li>• Confirmação antes da restauração</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Auditoria Screen
export const Auditoria = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
      <p className="text-muted-foreground">Consulte o log completo de ações realizadas no sistema.</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Log de Auditoria
        </CardTitle>
        <CardDescription>Esta tela permitirá:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Consulta e Filtros
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Filtros por usuário</li>
              <li>• Filtros por período</li>
              <li>• Busca por tipo de ação</li>
              <li>• Filtros por entidade afetada</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tipos de Log
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Login/logout de usuários</li>
              <li>• Criação, edição e exclusão</li>
              <li>• Fechamentos e reaberturas</li>
              <li>• Alterações em configurações</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
