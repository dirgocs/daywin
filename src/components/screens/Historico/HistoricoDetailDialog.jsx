import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  Clock, 
  DollarSign, 
  Calculator, 
  Briefcase, 
  MessageSquare,
  TrendingUp,
  CreditCard
} from 'lucide-react';

const HistoricoDetailDialog = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes do Dia de Trabalho
          </DialogTitle>
          <DialogDescription>
            Registro completo do trabalho realizado em {formatDate(item.data)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Data</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.data)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Diarista</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {item.diarista.nome}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <Badge 
                    variant={item.status === 'fechado' ? 'default' : 'secondary'}
                    className="gap-1 w-fit"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'fechado' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    {item.status === 'fechado' ? 'Fechado' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funções Exercidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Funções Exercidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {item.funcoes.map((funcao) => (
                  <div key={funcao.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{funcao.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Multiplicador de pontos
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {funcao.pontos}x
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Tempo e Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo & Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Horas Trabalhadas</div>
                    <div className="font-mono font-medium">{item.horas.toFixed(1)}h</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Pontos Calculados</div>
                    <Badge variant="secondary" className="font-mono">
                      {item.pontos.toFixed(1)} pts
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valores Financeiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Valor da Diária</div>
                    <div className="font-mono font-medium">{formatCurrency(item.valorDiaria)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Taxa de Serviço</div>
                    <div className="font-mono font-medium">{formatCurrency(item.taxaServico)}</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Valor Recebido</div>
                    <div className="font-mono font-bold text-green-600">
                      {formatCurrency(item.valorRecebido)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cálculo Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Detalhamento do Cálculo
              </CardTitle>
              <CardDescription>
                Como os valores foram calculados para este dia de trabalho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Horas</div>
                    <div className="font-mono font-medium">{item.horas}h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Multiplicador</div>
                    <div className="font-mono font-medium">
                      {item.funcoes.length > 1 ? 
                        `${Math.max(...item.funcoes.map(f => f.pontos))}x` : 
                        `${item.funcoes[0]?.pontos || 1}x`
                      }
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Pontos</div>
                    <div className="font-mono font-medium">{item.pontos.toFixed(1)}</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  {item.funcoes.length > 1 ? 
                    'Cálculo usando maior pontuação entre as funções' : 
                    'Cálculo: Horas × Multiplicador da Função'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {item.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{item.observacoes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoDetailDialog;