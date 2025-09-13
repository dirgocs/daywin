import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  User,
  MoreVertical,
  MessageSquare,
  Eye,
  Check,
  X
} from 'lucide-react';
import PendenciaDetailDialog from './PendenciaDetailDialog';
import ResolverPendenciaDialog from './ResolverPendenciaDialog';

const PendenciasList = ({ dados = [], onResolver, onMarcarResolvida }) => {
  const [selectedPendencia, setSelectedPendencia] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [resolverDialogOpen, setResolverDialogOpen] = useState(false);

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      'fechamento': 'Fechamento',
      'aprovacao': 'Aprovação',
      'inconsistencia': 'Inconsistência',
      'periodo_aberto': 'Período Aberto'
    };
    return labels[tipo] || tipo;
  };

  const isVencida = (dataLimite, status) => {
    if (status !== 'pendente') return false;
    return new Date(dataLimite) < new Date();
  };

  const handleViewDetails = (pendencia) => {
    setSelectedPendencia(pendencia);
    setDetailDialogOpen(true);
  };

  const handleResolver = (pendencia) => {
    setSelectedPendencia(pendencia);
    setResolverDialogOpen(true);
  };

  const handleMarcarResolvida = (pendencia) => {
    onMarcarResolvida(pendencia.id);
  };

  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma Pendência Encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <div className="text-muted-foreground">
              Nenhuma pendência foi encontrada com os filtros aplicados.
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Isso é uma boa notícia! Não há itens que precisem de atenção no momento.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {dados.map((pendencia) => {
          const TipoIcon = getTipoIcon(pendencia.tipo);
          const vencida = isVencida(pendencia.dataLimite, pendencia.status);
          
          return (
            <Card 
              key={pendencia.id} 
              className={`transition-all hover:shadow-md ${
                vencida ? 'border-red-200 bg-red-50/30' : ''
              } ${
                pendencia.status === 'resolvida' ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TipoIcon className="h-4 w-4" />
                      <CardTitle className="text-base">{pendencia.titulo}</CardTitle>
                      {vencida && (
                        <Badge variant="destructive" className="text-xs">
                          Vencida
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {pendencia.descricao}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {pendencia.status === 'pendente' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(pendencia)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResolver(pendencia)}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Resolver
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleMarcarResolvida(pendencia)}>
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como Resolvida
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    
                    {pendencia.status === 'resolvida' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pendência resolvida</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Prioridade
                    </div>
                    <Badge variant="outline" className="gap-1 w-fit">
                      <div className={`w-2 h-2 rounded-full ${getPrioridadeColor(pendencia.prioridade)}`}></div>
                      {getPrioridadeLabel(pendencia.prioridade)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Criada em
                    </div>
                    <div className="font-medium">{formatDate(pendencia.dataCriacao)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Prazo
                    </div>
                    <div className={`font-medium ${vencida ? 'text-red-600' : ''}`}>
                      {formatDate(pendencia.dataLimite)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Valor
                    </div>
                    <div className="font-medium">{formatCurrency(pendencia.valor)}</div>
                  </div>
                </div>
                
                {pendencia.diarista && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Diarista:</span>
                      <span className="font-medium">{pendencia.diarista.nome}</span>
                    </div>
                  </div>
                )}
                
                {pendencia.observacoes && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Observações:</div>
                        <div className="mt-1">{pendencia.observacoes}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialogs */}
      <PendenciaDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        pendencia={selectedPendencia}
      />
      
      <ResolverPendenciaDialog
        isOpen={resolverDialogOpen}
        onClose={() => setResolverDialogOpen(false)}
        pendencia={selectedPendencia}
        onResolver={onResolver}
      />
    </TooltipProvider>
  );
};

export default PendenciasList;