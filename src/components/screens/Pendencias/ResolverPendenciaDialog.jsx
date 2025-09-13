import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare
} from 'lucide-react';

const ResolverPendenciaDialog = ({ isOpen, onClose, pendencia, onResolver }) => {
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!pendencia) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      onResolver(pendencia.id, observacoes);
      onClose();
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao resolver pendência:', error);
    } finally {
      setLoading(false);
    }
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

  const getAcoesSugeridas = (tipo) => {
    const acoes = {
      'fechamento': [
        'Verificar todos os registros do período',
        'Confirmar valores de taxa de serviço',
        'Executar fechamento do período'
      ],
      'aprovacao': [
        'Revisar justificativa para valor excepcional',
        'Verificar autorização necessária',
        'Aprovar ou rejeitar a solicitação'
      ],
      'inconsistencia': [
        'Verificar dados originais',
        'Corrigir informações inconsistentes',
        'Validar cálculos refeitos'
      ],
      'periodo_aberto': [
        'Verificar se há registros pendentes',
        'Fechar período manualmente se necessário',
        'Definir nova data limite se apropriado'
      ]
    };
    return acoes[tipo] || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resolver Pendência
          </DialogTitle>
          <DialogDescription>
            Documente as ações tomadas para resolver esta pendência
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Informações da Pendência */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{pendencia.titulo}</h3>
                <Badge variant="outline">
                  {getTipoLabel(pendencia.tipo)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {pendencia.descricao}
              </p>
            </div>

            {/* Ações Sugeridas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Ações Recomendadas
              </Label>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <ul className="space-y-1 text-sm">
                  {getAcoesSugeridas(pendencia.tipo).map((acao, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {acao}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Campo de Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Observações da Resolução *
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva as ações tomadas para resolver esta pendência..."
                rows={4}
                required
                lang="pt-BR"
              />
              <div className="text-xs text-muted-foreground">
                Documente todas as ações realizadas e decisões tomadas para resolver esta pendência.
              </div>
            </div>

            {/* Observações Originais */}
            {pendencia.observacoes && (
              <div className="space-y-2">
                <Label>Observações Originais</Label>
                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  {pendencia.observacoes}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!observacoes.trim() || loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Resolvendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolver Pendência
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResolverPendenciaDialog;