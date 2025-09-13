import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Plus, Settings } from 'lucide-react';

const Funcoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funções e Cargos</h1>
        <p className="text-muted-foreground">
          Configure as funções disponíveis e seus pesos para cálculo de pontos.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Gerenciamento de Funções
          </CardTitle>
          <CardDescription>
            Esta tela incluirá:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Cadastro de Funções
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Nome da função</li>
                <li>• Peso em pontos (decimal)</li>
                <li>• Status ativo/inativo</li>
                <li>• Descrição opcional</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Edição de pesos</li>
                <li>• Ativação/desativação</li>
                <li>• Histórico de alterações</li>
                <li>• Validação de valores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Funcoes;
