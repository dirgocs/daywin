import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, Clock, DollarSign, Calculator, MessageSquare } from 'lucide-react';
import HistoricoDetailDialog from './HistoricoDetailDialog';

const HistoricoTable = ({ dados = [] }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum Registro Encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Nenhum registro de trabalho foi encontrado com os filtros aplicados.
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Tente ajustar os filtros ou verificar se existem dados no período selecionado.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Diarista</TableHead>
              <TableHead>Funções</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Clock className="h-4 w-4" />
                  Horas
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="h-4 w-4" />
                  Valor
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Calculator className="h-4 w-4" />
                  Pontos
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatDate(item.data)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{item.diarista.nome}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {item.funcoes.map((funcao) => (
                      <Tooltip key={funcao.id}>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs">
                            {funcao.nome}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{funcao.nome} ({funcao.pontos}x pontos)</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.horas.toFixed(1)}h
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(item.valorDiaria)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <Badge variant="secondary">
                    {item.pontos.toFixed(1)} pts
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === 'fechado' ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'fechado' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    {item.status === 'fechado' ? 'Fechado' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver detalhes</p>
                      </TooltipContent>
                    </Tooltip>
                    {item.observacoes && (
                      <Tooltip>
                        <TooltipTrigger>
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{item.observacoes}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Detalhes */}
      <HistoricoDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        item={selectedItem}
      />
    </TooltipProvider>
  );
};

export default HistoricoTable;