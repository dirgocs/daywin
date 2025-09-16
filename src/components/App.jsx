import React, { useState, useEffect } from 'react';
import Login from './Login';
import AppLayout from './AppLayout';
import CustomTitleBar from './CustomTitleBar';
import { ThemeProvider } from './theme-provider';
import { WeekCalendarPicker } from './WeekCalendarPicker';
import CadastroDiarista from './CadastroDiarista';
import RegistrarDia from './screens/RegistrarDia';
import Historico from './screens/Historico';
import ListaDiaristas from './screens/ListaDiaristas';
import Funcoes from './screens/Funcoes';
import Bonificacoes from './screens/Bonificacoes';
import Descontos from './screens/Descontos';
import TaxaServico from './screens/TaxaServico';
import DiariasAPagar from './screens/DiariasAPagar';
import NotImplemented from './screens/NotImplemented';
import Jornada from './screens/Jornada';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, AlertTriangle, TrendingUp, BarChart3, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { GastosMensalChart } from './GastosMensalChart';
import { DiaristasSemanaChart } from './DiaristasSemanaChart';
import { DiasTrabalhadosChart } from './DiasTrabalhadosChart';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = semana atual, -1 = semana anterior, etc.
  const [currentPage, setCurrentPage] = useState('dashboard'); // Controla qual página mostrar
  
  // Estados para controle do período mensal
  const [currentMonthStart, setCurrentMonthStart] = useState(() => {
    // Intervalo retroativo: 6 meses atrás a partir do mês atual
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 6, 1);
  });
  const [currentMonthEnd, setCurrentMonthEnd] = useState(() => {
    // Fim do intervalo retroativo: mês anterior ao atual
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 0);
  });

  // Função para calcular o início da semana (segunda-feira)
  const getWeekStart = (offset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar para segunda-feira
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (offset * 7));
    return monday;
  };

  // Função para formatar data
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Função para obter dados simulados da semana
  const getWeekData = (offset) => {
    // Calcular o início da semana baseado no offset
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (offset * 7));
    
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const baseCounts = [8, 12, 6, 15, 10, 4, 2];
    
    return dayNames.map((dayName, index) => {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + index);
      
      return {
        day: dayName,
        cleaners: Math.max(1, baseCounts[index] + (offset * 2) + Math.floor(Math.random() * 3 - 1)),
        date: formatDate(currentDay)
      };
    });
  };

  const navigateWeek = (direction) => {
    const newOffset = currentWeekOffset + direction;
    // Não permitir navegação para o futuro (semanas > 0)
    // Permitir navegação ampla no passado (até -52 semanas = 1 ano)
    if (newOffset >= -52 && newOffset <= 0) {
      setCurrentWeekOffset(newOffset);
    }
  };

  // Função para navegar entre páginas
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Função para obter o texto do intervalo da semana
  const getWeekRangeText = (offset) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (offset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };



  const formatMonthRange = (startDate, endDate) => {
    const formatMonth = (date) => {
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    };
    return `${formatMonth(startDate)} - ${formatMonth(endDate)}`;
  };

  // Função para gerar dados dos últimos 6 meses - versão simples funcional
  const getLastSixMonthsData = () => {
    const now = new Date();
    const months = [];
    
    // Valores simulados - em uma implementação real, estes viriam do banco de dados
    const baseValues = [1200, 2800, 4500, 1800, 3200, 2100];
    
    const maxValue = Math.max(...baseValues);
    
    // Gerar dados para os últimos 6 meses (excluindo o mês atual)
    for (let i = 6; i >= 1; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const value = baseValues[(6 - i) % baseValues.length];
      const height = (value / maxValue) * 100; // Altura proporcional ao valor máximo
      
      months.push({
        height,
        value: `R$ ${value.toLocaleString('pt-BR')}`,
        monthShort: monthName.charAt(0).toUpperCase() + monthName.slice(1, 3),
        rawValue: value
      });
    }
    
    return months;
  };


  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          // Electron environment
          const sessionData = await window.electronAPI.auth.checkSession();
          if (sessionData.user) {
            setUser(sessionData.user);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const checkSession = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const sessionData = await window.electronAPI.auth.checkSession();
        if (!sessionData.user) {
          setUser(null);
        } else if (sessionData.warning) {
          setSessionWarning(true);
          setTimeout(() => {
            if (sessionWarning) {
              handleLogout();
            }
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setSessionWarning(false);
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setSessionWarning(false);
    }
  };

  const extendSession = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.extendSession();
        setSessionWarning(false);
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="daywin-theme">
      <div className="App">
          <CustomTitleBar />
          
          {sessionWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-amber-600">Sessão Expirando</CardTitle>
                  <CardDescription>
                    Sua sessão expirará em 5 segundos por inatividade.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button onClick={extendSession} className="flex-1">
                      Continuar Sessão
                    </Button>
                    <Button onClick={handleLogout} variant="outline" className="flex-1">
                      Sair
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {user ? (
            <AppLayout user={user} onLogout={handleLogout} currentPage={currentPage} onNavigate={handleNavigate}>
              {currentPage === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Diaristas</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Nenhuma diarista cadastrada
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Dias Trabalhados</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Este mês
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gastos com Diárias</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">R$ 2.890,00</div>
                      <p className="text-xs text-muted-foreground">
                        Dezembro 2024 (parcial)
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pendências</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Nenhuma pendência
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <GastosMensalChart />
                  
                  <DiaristasSemanaChart />
                </div>
                
                {/* Third Chart - Days Worked per Cleaner */}
                <div className="mt-6">
                  <DiasTrabalhadosChart />
                </div>
                </div>
              )}
              
              {currentPage === 'cadastro-diarista' && (
                <CadastroDiarista onBack={() => setCurrentPage('dashboard')} />
              )}
              
              {currentPage === 'registrar-dia' && <RegistrarDia />}
              {currentPage === 'historico' && <Historico />}
              {currentPage === 'lista-diaristas' && <ListaDiaristas />}
              {currentPage === 'funcoes' && <Funcoes />}
              {currentPage === 'bonificacoes' && <Bonificacoes />}
              {currentPage === 'descontos' && <Descontos />}
              {currentPage === 'taxa-servico' && <TaxaServico />}
              {currentPage === 'diarias-a-pagar' && <DiariasAPagar />}
              {currentPage === 'fechamentos' && (
                <NotImplemented
                  pageName="Fechamentos"
                  description="Gerencie períodos e fechamentos para cálculo de pagamentos."
                  features={[
                    "Criar períodos (diário, semanal, quinzenal, mensal, custom)",
                    "Configurar âncoras e frequências",
                    "Visualizar períodos abertos/fechados",
                    "Prévia detalhada de cálculos",
                    "Fechamento definitivo e travamento",
                    "Exportação CSV/XLSX"
                  ]}
                />
              )}
              {currentPage === 'relatorios' && (
                <NotImplemented
                  pageName="Relatórios"
                  description="Gere relatórios detalhados sobre trabalho e pagamentos."
                  features={[
                    "Relatórios por período específico",
                    "Filtros por diarista individual",
                    "Agrupamento por função",
                    "Comparativos entre períodos",
                    "Exportação CSV/XLSX com formatação",
                    "Prévia antes da exportação"
                  ]}
                />
              )}
              {currentPage === 'analytics' && (
                <NotImplemented
                  pageName="Analytics"
                  description="Análises e insights sobre produtividade e custos."
                  features={[
                    "Gráficos de evolução mensal",
                    "Comparação ano sobre ano",
                    "Tendências de custos",
                    "ROI por diarista",
                    "Produtividade por função",
                    "Indicadores de eficiência"
                  ]}
                />
              )}
              {currentPage === 'performance' && (
                <NotImplemented
                  pageName="Performance"
                  description="Acompanhe indicadores de performance dos diaristas."
                  features={[
                    "Ranking por horas trabalhadas",
                    "Top performers do mês",
                    "Consistência de trabalho",
                    "Pontualidade e frequência",
                    "Produtividade por diarista",
                    "Comparação com médias"
                  ]}
                />
              )}
              {currentPage === 'regras' && (
                <NotImplemented
                  pageName="Regras e Distribuição"
                  description="Configure as regras de cálculo e distribuição de valores."
                  features={[
                    "Modo: pontos×horas, apenas horas ou fixo",
                    "Percentual da taxa para diaristas",
                    "Horas mínimas para elegibilidade",
                    "Arredondamento em cinquentavos",
                    "Frequência de fechamentos",
                    "Âncoras de período"
                  ]}
                />
              )}
              {currentPage === 'jornada' && <Jornada />}
              {currentPage === 'usuarios' && (
                <NotImplemented
                  pageName="Usuários e Papéis"
                  description="Gerencie usuários do sistema e suas permissões (RBAC)."
                  features={[
                    "Criar novos usuários",
                    "Definir login e senhas",
                    "Ativar/desativar contas",
                    "Histórico de acessos",
                    "Definir papéis (Gerente, Supervisor, etc.)",
                    "Configurar permissões granulares"
                  ]}
                />
              )}
              {currentPage === 'backup' && (
                <NotImplemented
                  pageName="Backup e Restore"
                  description="Faça backup e restaure dados do sistema."
                  features={[
                    "Backup completo do banco PGlite",
                    "Seleção de dados específicos",
                    "Validação de integridade",
                    "Compressão automática",
                    "Importar backups salvos",
                    "Verificação de compatibilidade"
                  ]}
                />
              )}
              {currentPage === 'auditoria' && (
                <NotImplemented
                  pageName="Auditoria"
                  description="Consulte o log completo de ações realizadas no sistema."
                  features={[
                    "Filtros por usuário",
                    "Filtros por período",
                    "Busca por tipo de ação",
                    "Filtros por entidade afetada",
                    "Login/logout de usuários",
                    "Alterações em configurações"
                  ]}
                />
              )}
            </AppLayout>
          ) : (
            <Login onLogin={handleLogin} />
          )}
      </div>
    </ThemeProvider>
  );
};

export default App;
