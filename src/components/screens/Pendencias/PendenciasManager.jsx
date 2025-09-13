import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileX, 
  User,
  Filter,
  MoreVertical,
  MessageSquare,
  Eye
} from 'lucide-react';
import PendenciasList from './PendenciasList';
import PendenciasStats from './PendenciasStats';
import PendenciasFilters from './PendenciasFilters';

const PendenciasManager = () => {
  const [filtros, setFiltros] = useState({
    tipo: '',
    prioridade: '',
    diarista: '',
    periodo: { inicio: '', fim: '' }
  });

  // Mock data para pendências
  const [pendenciasData] = useState([
    {
      id: 1,
      tipo: 'fechamento',
      titulo: 'Período sem fechamento - Dezembro 2024',
      descricao: 'Período de 01/12 a 15/12 ainda não foi fechado',
      prioridade: 'alta',
      dataCriacao: '2024-12-16',
      dataLimite: '2024-12-20',
      diarista: { id: 1, nome: 'Maria Silva' },
      valor: 850.00,
      status: 'pendente',
      observacoes: 'Aguardando confirmação dos valores de taxa de serviço'
    },
    {
      id: 2,
      tipo: 'aprovacao',
      titulo: 'Valor excepcional para aprovação',
      descricao: 'Diária de R$ 400,00 excede o limite padrão',
      prioridade: 'media',
      dataCriacao: '2024-12-15',
      dataLimite: '2024-12-18',
      diarista: { id: 2, nome: 'Ana Costa' },
      valor: 400.00,
      status: 'pendente',
      observacoes: 'Trabalho extra solicitado pelo cliente'
    },
    {
      id: 3,
      tipo: 'inconsistencia',
      titulo: 'Inconsistência nos dados de trabalho',
      descricao: 'Horas registradas não coincidem com valor da diária',
      prioridade: 'baixa',
      dataCriacao: '2024-12-14',
      dataLimite: '2024-12-17',
      diarista: { id: 4, nome: 'Paula Oliveira' },
      valor: 180.00,
      status: 'pendente',
      observacoes: 'Verificar se houve desconto aplicado'
    },
    {
      id: 4,
      tipo: 'periodo_aberto',
      titulo: 'Período em aberto há mais de 7 dias',
      descricao: 'Período iniciado em 01/12 ainda está em aberto',
      prioridade: 'alta',
      dataCriacao: '2024-12-10',
      dataLimite: '2024-12-15',
      diarista: null,
      valor: null,
      status: 'resolvida',
      observacoes: 'Período foi fechado manualmente'
    }
  ]);

  const [dadosFiltrados, setDadosFiltrados] = useState(pendenciasData);

  const aplicarFiltros = (novosFiltros) => {
    setFiltros(novosFiltros);
    
    let dadosFiltrados = [...pendenciasData];

    // Filtro por tipo
    if (novosFiltros.tipo) {
      dadosFiltrados = dadosFiltrados.filter(item => item.tipo === novosFiltros.tipo);
    }

    // Filtro por prioridade
    if (novosFiltros.prioridade) {
      dadosFiltrados = dadosFiltrados.filter(item => item.prioridade === novosFiltros.prioridade);
    }

    // Filtro por diarista
    if (novosFiltros.diarista) {
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.diarista && item.diarista.id.toString() === novosFiltros.diarista
      );
    }

    // Filtro por período
    if (novosFiltros.periodo.inicio || novosFiltros.periodo.fim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.dataCriacao);
        const inicio = novosFiltros.periodo.inicio ? new Date(novosFiltros.periodo.inicio) : new Date('1900-01-01');
        const fim = novosFiltros.periodo.fim ? new Date(novosFiltros.periodo.fim) : new Date('2100-12-31');
        return dataItem >= inicio && dataItem <= fim;
      });
    }

    setDadosFiltrados(dadosFiltrados);
  };

  const limparFiltros = () => {
    const filtrosVazios = {
      tipo: '',
      prioridade: '',
      diarista: '',
      periodo: { inicio: '', fim: '' }
    };
    setFiltros(filtrosVazios);
    setDadosFiltrados(pendenciasData);
  };

  const resolverPendencia = (pendenciaId, observacoes = '') => {
    console.log('Resolvendo pendência:', pendenciaId, observacoes);
    // Implementar lógica de resolução
  };

  const marcarComoResolvida = (pendenciaId) => {
    console.log('Marcando como resolvida:', pendenciaId);
    // Implementar lógica para marcar como resolvida
  };

  const temFiltrosAtivos = () => {
    return filtros.tipo || 
           filtros.prioridade || 
           filtros.diarista || 
           filtros.periodo.inicio || 
           filtros.periodo.fim;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pendências</h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie itens que precisam de atenção ou aprovação.
        </p>
      </div>

      {/* Estatísticas */}
      <PendenciasStats dados={dadosFiltrados} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Pendências
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar pendências específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendenciasFilters
            filtros={filtros}
            onChange={aplicarFiltros}
            onClear={limparFiltros}
          />
        </CardContent>
      </Card>

      {/* Lista de Pendências */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Lista de Pendências
                {temFiltrosAtivos() && (
                  <Badge variant="secondary" className="ml-2">
                    {dadosFiltrados.length} item(s) filtrado(s)
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {dadosFiltrados.length} pendência(s) encontrada(s)
              </CardDescription>
            </div>
            {temFiltrosAtivos() && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={limparFiltros}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <PendenciasList 
            dados={dadosFiltrados}
            onResolver={resolverPendencia}
            onMarcarResolvida={marcarComoResolvida}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PendenciasManager;