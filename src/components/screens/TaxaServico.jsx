import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Percent, DollarSign } from 'lucide-react';

const TaxaServico = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Taxa de Serviço</h1>
        <p className="text-muted-foreground">
          Gerencie as taxas de serviço arrecadadas para distribuição.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Controle de Taxa de Serviço
          </CardTitle>
          <CardDescription>Esta tela incluirá:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Registro
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Data da arrecadação</li>
                <li>• Valor total arrecadado</li>
                <li>• Referência/origem</li>
                <li>• Observações</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Distribuição
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cálculo automático por período</li>
                <li>• Percentual para diaristas</li>
                <li>• Divisão por pontos/horas</li>
                <li>• Histórico de distribuições</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxaServico;
