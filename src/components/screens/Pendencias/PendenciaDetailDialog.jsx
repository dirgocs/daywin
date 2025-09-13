import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare,
  CheckCircle,
  X
} from 'lucide-react';

const PendenciaDetailDialog = ({ isOpen, onClose, pendencia }) => {
  if (!pendencia) return null;

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
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

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      'alta': 'bg-red-500',
      'media': 'bg-yellow-500',
      'baixa': 'bg-green-500'
    };
    return colors[prioridade] || 'bg-gray-500';
  };

  const getPrioridadeLabel = (prioridade) => {
    const labels = {
      'alta': 'Alta',
      'media': 'Média',
      'baixa': 'Baixa'
    };
    return labels[prioridade] || prioridade;
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'fechamento': Calendar,
      'aprovacao': AlertTriangle,
      'inconsistencia': X,
      'periodo_aberto': Clock
    };
    return icons[tipo] || AlertTriangle;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'fechamento': 'Fechamento Pendente',
      'aprovacao': 'Necessita Aprovação',
      'inconsistencia': 'Inconsistência de Dados',
      'periodo_aberto': 'Período em Aberto'
    };
    return labels[tipo] || tipo;
  };

  const isVencida = (dataLimite, status) => {
    if (status !== 'pendente') return false;
    return new Date(dataLimite) < new Date();
  };

  const TipoIcon = getTipoIcon(pendencia.tipo);
  const vencida = isVencida(pendencia.dataLimite, pendencia.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TipoIcon className="h-5 w-5" />
            Detalhes da Pendência
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre esta pendência
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status e Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{pendencia.titulo}</span>
                <div className="flex items-center gap-2">
                  {vencida && (
                    <Badge variant="destructive" className="text-xs">
                      Vencida
                    </Badge>
                  )}
                  {pendencia.status === 'resolvida' && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Resolvida
                    </Badge>
                  )}
                  {pendencia.status === 'pendente' && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pendente
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Descrição</div>
                  <p className="text-sm">{pendencia.descricao}</p>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Tipo</div>
                  <Badge variant="outline" className="gap-1">
                    <TipoIcon className="h-3 w-3" />
                    {getTipoLabel(pendencia.tipo)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cronograma e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Data de Criação</div>
                    <div className="text-sm font-medium">{formatDate(pendencia.dataCriacao)}</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Prazo Limite</div>
                    <div className={`text-sm font-medium ${vencida ? 'text-red-600' : ''}`}>
                      {formatDate(pendencia.dataLimite)}
                    </div>
                  </div>
                  {vencida && (
                    <div className="text-xs text-red-600 text-center pt-2 border-t border-red-200">
                      ⚠️ Esta pendência está vencida
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Prioridade & Valor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Prioridade</div>
                    <Badge variant="outline" className="gap-1">
                      <div className={`w-2 h-2 rounded-full ${getPrioridadeColor(pendencia.prioridade)}`}></div>
                      {getPrioridadeLabel(pendencia.prioridade)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Valor Envolvido</div>
                    <div className="text-sm font-medium">{formatCurrency(pendencia.valor)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Diarista Envolvida */}
          {pendencia.diarista && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Diarista Envolvida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{pendencia.diarista.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {pendencia.diarista.id}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {pendencia.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{pendencia.observacoes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações Sugeridas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendencia.tipo === 'fechamento' && (
                  <div className="text-sm">
                    • Verificar todos os registros do período<br/>
                    • Confirmar valores de taxa de serviço<br/>
                    • Executar fechamento do período
                  </div>
                )}
                {pendencia.tipo === 'aprovacao' && (
                  <div className="text-sm">
                    • Revisar justificativa para valor excepcional<br/>
                    • Verificar autorização necessária<br/>
                    • Aprovar ou rejeitar a solicitação
                  </div>
                )}
                {pendencia.tipo === 'inconsistencia' && (
                  <div className="text-sm">
                    • Verificar dados originais<br/>
                    • Corrigir informações inconsistentes<br/>
                    • Validar cálculos refeitos
                  </div>
                )}
                {pendencia.tipo === 'periodo_aberto' && (
                  <div className="text-sm">
                    • Verificar se há registros pendentes<br/>
                    • Fechar período manualmente se necessário<br/>
                    • Definir nova data limite se apropriado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendenciaDetailDialog;