import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Calendar, Users, CheckCircle, Clock, AlertCircle, Eye, FileText } from 'lucide-react';

const DiariasAPagar = () => {
  const [diasConsolidados, setDiasConsolidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [payrollData, setPayrollData] = useState(null);

  useEffect(() => {
    loadDiariasAPagar();
  }, []);

  const loadDiariasAPagar = async () => {
    try {
      setLoading(true);

      // Buscar dados consolidados de todas as fontes
      const [diasTrabalhados, bonificacoes, descontos, taxasServico, diaristasData] = await Promise.all([
        window.electronAPI.invoke('get-dias-trabalhados-pendentes'),
        window.electronAPI.invoke('get-bonificacoes-pendentes'),
        window.electronAPI.invoke('get-descontos-pendentes'),
        window.electronAPI.invoke('get-taxas-servico-pendentes'),
        window.electronAPI.invoke('get-diaristas')
      ]);

      // Consolidar dados por data
      const consolidado = consolidarDadosPorData(
        diasTrabalhados.data || [],
        bonificacoes.data || [],
        descontos.data || [],
        taxasServico.data || [],
        diaristasData.data || []
      );

      setDiasConsolidados(consolidado);
    } catch (error) {
      console.error('Erro ao carregar diárias a pagar:', error);
    } finally {
      setLoading(false);
    }
  };

  const consolidarDadosPorData = (dias, bonus, desc, taxas, diaristasData) => {
    const dataMap = new Map();

    // Processar dias trabalhados agrupando por data
    dias.forEach(dia => {
      const dataKey = dia.data; // Formato: YYYY-MM-DD

      if (!dataMap.has(dataKey)) {
        dataMap.set(dataKey, {
          data: dataKey,
          diaristas: new Map(),
          atendimento: { count: 0, total: 0 },
          cozinha: { count: 0, total: 0 },
          totalDiarias: 0,
          totalBonificacoes: 0,
          totalDescontos: 0,
          totalTaxaServico: 0,
          totalGeral: 0,
          valorMedio: 0,
          statusPago: false
        });
      }

      const dataItem = dataMap.get(dataKey);
      const diarista = diaristasData.find(d => d.diarista_id === dia.diarista_id);
      const funcao = dia.funcao?.funcao_nome || 'Atendimento';
      const valor = parseFloat(dia.diaria_valor || 0);

      // Categorizar por setor baseado na função
      const isAtendimento = !funcao.toLowerCase().includes('cozinha');
      if (isAtendimento) {
        dataItem.atendimento.count++;
        dataItem.atendimento.total += valor;
      } else {
        dataItem.cozinha.count++;
        dataItem.cozinha.total += valor;
      }

      dataItem.totalDiarias += valor;

      // Armazenar detalhes do diarista para o payroll
      if (!dataItem.diaristas.has(dia.diarista_id)) {
        dataItem.diaristas.set(dia.diarista_id, {
          diarista_id: dia.diarista_id,
          nome: diarista?.nome_completo || 'N/A',
          apelido: diarista?.apelido,
          funcao: funcao,
          setor: isAtendimento ? 'Atendimento' : 'Cozinha',
          diarias: 0,
          bonificacoes: 0,
          descontos: 0,
          cotaTaxa: 0,
          total: 0,
          pago: false,
          detalhes: {
            dias: [],
            bonificacoes: [],
            descontos: []
          }
        });
      }

      const diaristaItem = dataItem.diaristas.get(dia.diarista_id);
      diaristaItem.diarias += valor;
      diaristaItem.detalhes.dias.push(dia);
    });

    // Processar bonificações por data
    bonus.forEach(bonificacao => {
      const dataKey = bonificacao.data;
      if (dataMap.has(dataKey)) {
        const dataItem = dataMap.get(dataKey);
        const valor = parseFloat(bonificacao.valor || 0);
        dataItem.totalBonificacoes += valor;

        if (dataItem.diaristas.has(bonificacao.diarista_id)) {
          const diaristaItem = dataItem.diaristas.get(bonificacao.diarista_id);
          diaristaItem.bonificacoes += valor;
          diaristaItem.detalhes.bonificacoes.push(bonificacao);
        }
      }
    });

    // Processar descontos por data
    desc.forEach(desconto => {
      const dataKey = desconto.data;
      if (dataMap.has(dataKey)) {
        const dataItem = dataMap.get(dataKey);
        const valor = parseFloat(desconto.valor || 0);
        dataItem.totalDescontos += valor;

        if (dataItem.diaristas.has(desconto.diarista_id)) {
          const diaristaItem = dataItem.diaristas.get(desconto.diarista_id);
          diaristaItem.descontos += valor;
          diaristaItem.detalhes.descontos.push(desconto);
        }
      }
    });

    // Calcular taxa de serviço (distribuição proporcional por data)
    const totalTaxas = taxas.reduce((sum, taxa) => sum + parseFloat(taxa.valor_arrecadado || 0), 0);
    const totalDias = dataMap.size;
    const taxaPorDia = totalDias > 0 ? totalTaxas / totalDias : 0;

    // Finalizar cálculos por data
    dataMap.forEach(dataItem => {
      dataItem.totalTaxaServico = taxaPorDia;

      // Distribuir taxa entre diaristas da data
      const numDiaristas = dataItem.diaristas.size;
      const taxaPorDiarista = numDiaristas > 0 ? taxaPorDia / numDiaristas : 0;

      dataItem.diaristas.forEach(diaristaItem => {
        diaristaItem.cotaTaxa = taxaPorDiarista;
        diaristaItem.total = diaristaItem.diarias + diaristaItem.bonificacoes + diaristaItem.cotaTaxa - diaristaItem.descontos;
      });

      dataItem.totalGeral = dataItem.totalDiarias + dataItem.totalBonificacoes + dataItem.totalTaxaServico - dataItem.totalDescontos;

      const totalDiaristas = dataItem.atendimento.count + dataItem.cozinha.count;
      dataItem.valorMedio = totalDiaristas > 0 ? dataItem.totalDiarias / totalDiaristas : 0;

      // Verificar se todos os diaristas da data estão pagos
      dataItem.statusPago = Array.from(dataItem.diaristas.values()).every(d => d.pago);
    });

    return Array.from(dataMap.values()).sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const handlePagamentoChange = async (diaristaId, pago, data) => {
    try {
      await window.electronAPI.invoke('update-pagamento-diarista', { diaristaId, pago });

      // Atualizar estado local
      setDiasConsolidados(prev => prev.map(dia => {
        if (dia.data === data) {
          const updatedDiaristas = new Map(dia.diaristas);
          if (updatedDiaristas.has(diaristaId)) {
            const diarista = updatedDiaristas.get(diaristaId);
            diarista.pago = pago;
            updatedDiaristas.set(diaristaId, diarista);
          }

          // Recalcular status do dia
          const statusPago = Array.from(updatedDiaristas.values()).every(d => d.pago);

          return {
            ...dia,
            diaristas: updatedDiaristas,
            statusPago
          };
        }
        return dia;
      }));
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
    }
  };

  const openPayrollModal = (dataItem) => {
    setSelectedDate(dataItem.data);
    setPayrollData({
      data: dataItem.data,
      diaristas: Array.from(dataItem.diaristas.values())
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando diárias a pagar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diárias a Pagar</h1>
        <p className="text-muted-foreground">
          Controle de pagamentos consolidado por data
        </p>
      </div>


      {/* Tabela principal - Consolidado por Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consolidado por Data
          </CardTitle>
          <CardDescription>
            Clique em "Ver Payroll" para ver detalhes individualizados por diarista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Atendimento</TableHead>
                <TableHead className="text-center">Cozinha</TableHead>
                <TableHead className="text-right">Valor Médio</TableHead>
                <TableHead className="text-right">Total Diárias</TableHead>
                <TableHead className="text-right">Bonificações</TableHead>
                <TableHead className="text-right">Taxa Serviço</TableHead>
                <TableHead className="text-right">Total a Pagar</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diasConsolidados.map((dia) => (
                <TableRow key={dia.data} className={dia.statusPago ? "bg-green-50" : ""}>
                  <TableCell>
                    <div className="font-medium">{formatDate(dia.data)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">{dia.atendimento.count}</div>
                      <div className="text-muted-foreground">{formatCurrency(dia.atendimento.total)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">{dia.cozinha.count}</div>
                      <div className="text-muted-foreground">{formatCurrency(dia.cozinha.total)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(dia.valorMedio)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dia.totalDiarias)}</TableCell>
                  <TableCell className="text-right text-green-600">
                    +{formatCurrency(dia.totalBonificacoes)}
                  </TableCell>
                  <TableCell className="text-right text-blue-600">
                    +{formatCurrency(dia.totalTaxaServico)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(dia.totalGeral)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={dia.statusPago ? "default" : "secondary"}>
                      {dia.statusPago ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPayrollModal(dia)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Payroll
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Payroll Detalhado - {formatDate(dia.data)}
                          </DialogTitle>
                          <DialogDescription>
                            Detalhes individualizados por diarista
                          </DialogDescription>
                        </DialogHeader>

                        {payrollData && payrollData.data === dia.data && (
                          <div className="space-y-4">
                            {/* Resumo do dia */}
                            <Card>
                              <CardContent className="pt-4">
                                <div className="grid grid-cols-4 gap-4 text-center">
                                  <div>
                                    <div className="text-2xl font-bold">{dia.atendimento.count + dia.cozinha.count}</div>
                                    <div className="text-sm text-muted-foreground">Total Diaristas</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(dia.valorMedio)}</div>
                                    <div className="text-sm text-muted-foreground">Valor Médio</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(dia.totalDiarias)}</div>
                                    <div className="text-sm text-muted-foreground">Total Diárias</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(dia.totalGeral)}</div>
                                    <div className="text-sm text-muted-foreground">Total Geral</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Tabela de diaristas */}
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Diarista</TableHead>
                                  <TableHead>Setor</TableHead>
                                  <TableHead className="text-right">Diárias</TableHead>
                                  <TableHead className="text-right">Bonificações</TableHead>
                                  <TableHead className="text-right">Descontos</TableHead>
                                  <TableHead className="text-right">Taxa</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead className="text-center">Pago</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {payrollData.diaristas.map((diarista) => (
                                  <TableRow key={diarista.diarista_id} className={diarista.pago ? "bg-green-50" : ""}>
                                    <TableCell>
                                      <div className="font-medium">{diarista.nome}</div>
                                      {diarista.apelido && (
                                        <div className="text-sm text-muted-foreground">({diarista.apelido})</div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={diarista.setor === 'Cozinha' ? 'secondary' : 'outline'}>
                                        {diarista.setor}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(diarista.diarias)}</TableCell>
                                    <TableCell className="text-right text-green-600">
                                      +{formatCurrency(diarista.bonificacoes)}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">
                                      -{formatCurrency(diarista.descontos)}
                                    </TableCell>
                                    <TableCell className="text-right text-blue-600">
                                      +{formatCurrency(diarista.cotaTaxa)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                      {formatCurrency(diarista.total)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={diarista.pago}
                                        onCheckedChange={(checked) =>
                                          handlePagamentoChange(diarista.diarista_id, checked, dia.data)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiariasAPagar;