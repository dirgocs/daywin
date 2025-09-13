import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, AlertCircle, Calendar } from 'lucide-react';

const Descontos = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Descontos</h1>
        <p className="text-muted-foreground">
          Registre descontos aplicados aos diaristas.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5" />
            Gerenciamento de Descontos
          </CardTitle>
          <CardDescription>Funcionalidades incluem:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Registro
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seleção de diarista</li>
                <li>• Data do desconto</li>
                <li>• Valor descontado</li>
                <li>• Motivo/justificativa</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Controle
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Histórico completo</li>
                <li>• Aprovação de descontos</li>
                <li>• Relatórios detalhados</li>
                <li>• Auditoria de alterações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Descontos;
