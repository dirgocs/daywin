import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  DollarSign 
} from 'lucide-react';

const PendenciasStats = ({ dados = [] }) => {
  // Calcular estatísticas
  const stats = React.useMemo(() => {
    if (dados.length === 0) {
      return {
        totalPendencias: 0,
        pendentes: 0,
        resolvidas: 0,
        prioridadeAlta: 0,
        valorTotal: 0,
        vencidas: 0,
        tipos: {}
      };
    }

    const hoje = new Date();
    
    const pendentes = dados.filter(item => item.status === 'pendente').length;
    const resolvidas = dados.filter(item => item.status === 'resolvida').length;
    const prioridadeAlta = dados.filter(item => item.prioridade === 'alta').length;
    
    const valorTotal = dados.reduce((sum, item) => sum + (item.valor || 0), 0);
    
    const vencidas = dados.filter(item => 
      item.status === 'pendente' && new Date(item.dataLimite) < hoje
    ).length;

    // Distribuição por tipo
    const tipos = dados.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPendencias: dados.length,
      pendentes,
      resolvidas,
      prioridadeAlta,
      valorTotal,
      vencidas,
      tipos
    };
  }, [dados]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'fechamento': 'Fechamentos',
      'aprovacao': 'Aprovações',
      'inconsistencia': 'Inconsistências',
      'periodo_aberto': 'Períodos Abertos'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Pendências */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPendencias}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendentes} pendente(s), {stats.resolvidas} resolvida(s)
          </p>
        </CardContent>
      </Card>

      {/* Pendências Ativas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{stats.pendentes}</div>
          <p className="text-xs text-muted-foreground">
            {stats.vencidas} vencida(s)
          </p>
        </CardContent>
      </Card>

      {/* Prioridade Alta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prioridade Alta</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.prioridadeAlta}</div>
          <p className="text-xs text-muted-foreground">
            Requer atenção imediata
          </p>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Envolvido</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Em pendências ativas
          </p>
        </CardContent>
      </Card>

      {/* Distribuição por Tipo */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.tipos).map(([tipo, count]) => (
              <Badge 
                key={tipo} 
                variant="outline" 
                className="gap-1"
              >
                {getTipoLabel(tipo)}: {count}
              </Badge>
            ))}
            {dados.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhuma pendência encontrada com os filtros aplicados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendenciasStats;