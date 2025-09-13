import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, TrendingUp, Users, Briefcase, Calculator } from 'lucide-react';

const HistoricoStats = ({ dados = [] }) => {
  // Calcular estatísticas
  const stats = React.useMemo(() => {
    if (dados.length === 0) {
      return {
        totalRegistros: 0,
        totalHoras: 0,
        totalValorDiarias: 0,
        totalTaxaServico: 0,
        totalValorRecebido: 0,
        mediaPontos: 0,
        diariasUnicas: 0,
        funcoesUnicas: 0,
        statusDistribution: {}
      };
    }

    const totalHoras = dados.reduce((sum, item) => sum + item.horas, 0);
    const totalValorDiarias = dados.reduce((sum, item) => sum + item.valorDiaria, 0);
    const totalTaxaServico = dados.reduce((sum, item) => sum + item.taxaServico, 0);
    const totalValorRecebido = dados.reduce((sum, item) => sum + item.valorRecebido, 0);
    const totalPontos = dados.reduce((sum, item) => sum + item.pontos, 0);
    
    const diariasUnicas = new Set(dados.map(item => item.diarista.id)).size;
    const funcaoIds = new Set();
    dados.forEach(item => {
      item.funcoes.forEach(funcao => funcaoIds.add(funcao.id));
    });

    // Distribuição por status
    const statusDistribution = dados.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRegistros: dados.length,
      totalHoras,
      totalValorDiarias,
      totalTaxaServico,
      totalValorRecebido,
      mediaPontos: dados.length > 0 ? totalPontos / dados.length : 0,
      diariasUnicas,
      funcoesUnicas: funcaoIds.size,
      statusDistribution
    };
  }, [dados]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatHours = (hours) => {
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Registros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registros</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRegistros}</div>
          <p className="text-xs text-muted-foreground">
            {stats.diariasUnicas} diarista(s) diferentes
          </p>
        </CardContent>
      </Card>

      {/* Total de Horas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(stats.totalHoras)}</div>
          <p className="text-xs text-muted-foreground">
            Média: {stats.totalRegistros > 0 ? formatHours(stats.totalHoras / stats.totalRegistros) : '0h'} por dia
          </p>
        </CardContent>
      </Card>

      {/* Total Valor das Diárias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Diárias</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalValorDiarias)}</div>
          <p className="text-xs text-muted-foreground">
            Média: {stats.totalRegistros > 0 ? formatCurrency(stats.totalValorDiarias / stats.totalRegistros) : formatCurrency(0)}
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Serviço */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Serviço</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalTaxaServico)}</div>
          <p className="text-xs text-muted-foreground">
            Recebido: {formatCurrency(stats.totalValorRecebido)}
          </p>
        </CardContent>
      </Card>

      {/* Estatísticas Adicionais */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Resumo Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Funções Diferentes</div>
              <div className="text-lg font-bold">{stats.funcoesUnicas}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Média de Pontos</div>
              <div className="text-lg font-bold">{stats.mediaPontos.toFixed(1)} pts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Status */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Status dos Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <Badge 
                key={status} 
                variant={status === 'fechado' ? 'default' : 'secondary'}
                className="gap-1"
              >
                <div className={`w-2 h-2 rounded-full ${
                  status === 'fechado' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                {status === 'fechado' ? 'Fechados' : 'Pendentes'}: {count}
              </Badge>
            ))}
            {dados.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhum registro encontrado com os filtros aplicados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoStats;