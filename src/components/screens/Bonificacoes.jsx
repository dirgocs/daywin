import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Plus, Calendar } from 'lucide-react';

const Bonificacoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bonificações</h1>
        <p className="text-muted-foreground">
          Gerencie bonificações e incentivos para os diaristas.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gerenciamento de Bonificações
          </CardTitle>
          <CardDescription>
            Esta tela permitirá:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Registro de Bônus
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seleção de diarista</li>
                <li>• Data da bonificação</li>
                <li>• Valor do bônus</li>
                <li>• Motivo/descrição</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Histórico
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Lista de bonificações</li>
                <li>• Filtros por período</li>
                <li>• Edição/exclusão</li>
                <li>• Relatórios por diarista</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bonificacoes;
