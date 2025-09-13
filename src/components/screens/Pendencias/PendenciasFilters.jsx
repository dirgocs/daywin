import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, User, AlertTriangle, Filter, X } from 'lucide-react';

const PendenciasFilters = ({ filtros, onChange, onClear }) => {
  // Mock data para diaristas
  const mockDiaristas = [
    { id: 1, nome: 'Maria Silva', ativo: true },
    { id: 2, nome: 'Ana Costa', ativo: true },
    { id: 4, nome: 'Paula Oliveira', ativo: true },
  ];

  const handlePeriodoChange = (campo, valor) => {
    const novoPeriodo = { ...filtros.periodo, [campo]: valor };
    onChange({ ...filtros, periodo: novoPeriodo });
  };

  const handleTipoChange = (valor) => {
    onChange({ ...filtros, tipo: valor });
  };

  const handlePrioridadeChange = (valor) => {
    onChange({ ...filtros, prioridade: valor });
  };

  const handleDiaristaChange = (valor) => {
    onChange({ ...filtros, diarista: valor });
  };

  return (
    <div className="space-y-4">
      {/* Filtros de Tipo e Prioridade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Tipo de Pendência
          </Label>
          <Select value={filtros.tipo} onValueChange={handleTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="fechamento">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fechamentos
                </div>
              </SelectItem>
              <SelectItem value="aprovacao">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Aprovações
                </div>
              </SelectItem>
              <SelectItem value="inconsistencia">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Inconsistências
                </div>
              </SelectItem>
              <SelectItem value="periodo_aberto">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Períodos Abertos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Prioridade
          </Label>
          <Select value={filtros.prioridade} onValueChange={handlePrioridadeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="alta">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Alta
                </div>
              </SelectItem>
              <SelectItem value="media">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Média
                </div>
              </SelectItem>
              <SelectItem value="baixa">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Baixa
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Diarista */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Diarista
        </Label>
        <Select value={filtros.diarista} onValueChange={handleDiaristaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as diaristas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as diaristas</SelectItem>
            {mockDiaristas.map((diarista) => (
              <SelectItem key={diarista.id} value={diarista.id.toString()}>
                {diarista.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtros de Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data-inicio" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data Criação (Início)
          </Label>
          <Input
            id="data-inicio"
            type="date"
            value={filtros.periodo.inicio}
            onChange={(e) => handlePeriodoChange('inicio', e.target.value)}
            lang="pt-BR"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="data-fim" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data Criação (Fim)
          </Label>
          <Input
            id="data-fim"
            type="date"
            value={filtros.periodo.fim}
            onChange={(e) => handlePeriodoChange('fim', e.target.value)}
            lang="pt-BR"
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={onClear} variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
        <div className="text-sm text-muted-foreground flex items-center ml-auto">
          Use os filtros acima para encontrar pendências específicas
        </div>
      </div>
    </div>
  );
};

export default PendenciasFilters;