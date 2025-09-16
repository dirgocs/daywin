import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Construction, Calendar, Users, FileText, Settings, BarChart3, Wrench, ArrowLeft } from 'lucide-react';

const NotImplemented = ({
  pageName = "Esta página",
  description = "Funcionalidade em desenvolvimento",
  onBack,
  features = []
}) => {
  const defaultFeatures = [
    "Interface de usuário completa",
    "Integração com banco de dados",
    "Validações e formulários",
    "Relatórios e exportação",
    "Filtros avançados"
  ];

  const getIcon = () => {
    if (pageName.toLowerCase().includes('relatório') || pageName.toLowerCase().includes('analytics')) {
      return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
    }
    if (pageName.toLowerCase().includes('usuário') || pageName.toLowerCase().includes('papel')) {
      return <Users className="h-12 w-12 text-muted-foreground" />;
    }
    if (pageName.toLowerCase().includes('backup') || pageName.toLowerCase().includes('auditoria')) {
      return <FileText className="h-12 w-12 text-muted-foreground" />;
    }
    if (pageName.toLowerCase().includes('jornada') || pageName.toLowerCase().includes('regra')) {
      return <Settings className="h-12 w-12 text-muted-foreground" />;
    }
    if (pageName.toLowerCase().includes('fechamento')) {
      return <Calendar className="h-12 w-12 text-muted-foreground" />;
    }
    return <Construction className="h-12 w-12 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{pageName}</h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex justify-center py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl">Página em Desenvolvimento</CardTitle>
            <CardDescription className="text-lg">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                <Wrench className="h-3 w-3 mr-1" />
                Em construção
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Funcionalidades planejadas:</h3>
                <ul className="space-y-2">
                  {(features.length > 0 ? features : defaultFeatures).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Status do desenvolvimento:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Planejamento</span>
                    <span className="text-green-600">✓ Concluído</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Design da interface</span>
                    <span className="text-yellow-600">🔄 Em andamento</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Implementação</span>
                    <span className="text-muted-foreground">⏳ Pendente</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Testes</span>
                    <span className="text-muted-foreground">⏳ Pendente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              {onBack && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Atualizar página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          💡 <strong>Sugestão:</strong> Use o menu lateral para acessar as funcionalidades já implementadas
        </p>
      </div>
    </div>
  );
};

export default NotImplemented;