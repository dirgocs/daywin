import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Briefcase, DollarSign, Filter, Download, Search, CalendarDays } from 'lucide-react';
import { ChartBarInteractive } from '@/components/ui/ChartBarInteractive';
import HistoricoFilters from './HistoricoFilters';
import HistoricoTable from './HistoricoTable';
import HistoricoStats from './HistoricoStats';

const HistoricoManager = () => {
  const [filtros, setFiltros] = useState({
    periodo: { inicio: '', fim: '' },
    diarista: '',
    funcoes: [],
    status: ''
  });

  const [historicoData] = useState([
    {
      id: 1,
      data: '2024-01-15',
      diarista: { id: 1, nome: 'Maria Silva' },
      funcoes: [
        { id: 1, nome: 'Limpeza Geral', pontos: 1.0 },
        { id: 2, nome: 'Cozinha', pontos: 1.2 }
      ],
      horas: 8,
      valorDiaria: 200.00,
      pontos: 9.6,
      taxaServico: 150.00,
      valorRecebido: 120.00,
      observacoes: 'Trabalho completo sem intercorrências',
      status: 'fechado'
    },
    {
      id: 2,
      data: '2024-01-16',
      diarista: { id: 2, nome: 'Ana Costa' },
      funcoes: [
        { id: 3, nome: 'Organização', pontos: 0.8 }
      ],
      horas: 6,
      valorDiaria: 150.00,
      pontos: 4.8,
      taxaServico: 120.00,
      valorRecebido: 96.00,
      observacoes: 'Foco em organização de armários',
      status: 'fechado'
    },
    {
      id: 3,
      data: '2024-01-17',
      diarista: { id: 4, nome: 'Paula Oliveira' },
      funcoes: [
        { id: 2, nome: 'Limpeza Pesada', pontos: 1.5 }
      ],
      horas: 10,
      valorDiaria: 280.00,
      pontos: 15.0,
      taxaServico: 200.00,
      valorRecebido: 160.00,
      observacoes: 'Limpeza pós-obra concluída',
      status: 'pendente'
    }
  ]);

  const [dadosFiltrados, setDadosFiltrados] = useState(historicoData);

  // Preparar dados do gráfico baseados no histórico
  const prepararDadosGrafico = (dados) => {
    // Agrupar dados por data e calcular valores por setor
    const dadosPorData = dados.reduce((acc, item) => {
      const data = item.data;

      if (!acc[data]) {
        acc[data] = {
          date: data,
          total: 0,
          atendimento: 0,
          producao: 0
        };
      }

      // Verificar se é cozinha/produção ou atendimento
      const isProducao = item.funcoes.some(f =>
        f.nome.toLowerCase().includes('cozinha') ||
        f.nome.toLowerCase().includes('produção')
      );

      const valor = item.valorRecebido || 0;
      acc[data].total += valor;

      if (isProducao) {
        acc[data].producao += valor;
      } else {
        acc[data].atendimento += valor;
      }

      return acc;
    }, {});

    // Converter para array e ordenar por data
    return Object.values(dadosPorData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const aplicarFiltros = (novosFiltros) => {
    setFiltros(novosFiltros);
    
    let dadosFiltrados = [...historicoData];

    // Filtro por período
    if (novosFiltros.periodo.inicio || novosFiltros.periodo.fim) {
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.data);
        const inicio = novosFiltros.periodo.inicio ? new Date(novosFiltros.periodo.inicio) : new Date('1900-01-01');
        const fim = novosFiltros.periodo.fim ? new Date(novosFiltros.periodo.fim) : new Date('2100-12-31');
        return dataItem >= inicio && dataItem <= fim;
      });
    }

    // Filtro por diarista
    if (novosFiltros.diarista) {
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.diarista.id.toString() === novosFiltros.diarista
      );
    }

    // Filtro por funções
    if (novosFiltros.funcoes.length > 0) {
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.funcoes.some(funcao => 
          novosFiltros.funcoes.includes(funcao.id.toString())
        )
      );
    }

    // Filtro por status
    if (novosFiltros.status) {
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.status === novosFiltros.status
      );
    }

    setDadosFiltrados(dadosFiltrados);
  };

  const limparFiltros = () => {
    const filtrosVazios = {
      periodo: { inicio: '', fim: '' },
      diarista: '',
      funcoes: [],
      status: ''
    };
    setFiltros(filtrosVazios);
    setDadosFiltrados(historicoData);
  };

  const exportarDados = () => {
    console.log('Exportando dados:', dadosFiltrados);
    // Implementar exportação CSV/XLSX
  };

  const temFiltrosAtivos = () => {
    return filtros.periodo.inicio || 
           filtros.periodo.fim || 
           filtros.diarista || 
           filtros.funcoes.length > 0 || 
           filtros.status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Pagamentos</h1>
        <p className="text-muted-foreground">
          Consulte o histórico completo de pagamentos com análise visual e filtros avançados.
        </p>
      </div>

      {/* Gráfico de valores pagos */}
      <ChartBarInteractive data={prepararDadosGrafico(dadosFiltrados)} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Consulta
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para refinar sua consulta no histórico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoricoFilters
            filtros={filtros}
            onChange={aplicarFiltros}
            onClear={limparFiltros}
          />
        </CardContent>
      </Card>

      {/* Estatísticas dos Resultados */}
      <HistoricoStats dados={dadosFiltrados} />

      {/* Resultados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Resultados da Consulta
                {temFiltrosAtivos() && (
                  <Badge variant="secondary" className="ml-2">
                    {dadosFiltrados.length} registro(s) filtrado(s)
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {dadosFiltrados.length} registro(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {temFiltrosAtivos() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={limparFiltros}
                >
                  Limpar Filtros
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportarDados}
                disabled={dadosFiltrados.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HistoricoTable dados={dadosFiltrados} />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoManager;