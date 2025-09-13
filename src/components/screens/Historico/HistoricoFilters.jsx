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
import { Calendar, User, Briefcase, Filter, X } from 'lucide-react';
import FuncaoMultiSelect from './FuncaoMultiSelect';

const HistoricoFilters = ({ filtros, onChange, onClear }) => {
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

  const handleDiaristaChange = (valor) => {
    onChange({ ...filtros, diarista: valor });
  };

  const handleFuncoesChange = (funcoesSelecionadas) => {
    onChange({ ...filtros, funcoes: funcoesSelecionadas });
  };

  const handleStatusChange = (valor) => {
    onChange({ ...filtros, status: valor });
  };

  return (
    <div className="space-y-4">
      {/* Filtros de Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data-inicio" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data Início
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
            Data Fim
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

      {/* Filtros de Diarista e Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status
          </Label>
          <Select value={filtros.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Pendente
                </div>
              </SelectItem>
              <SelectItem value="fechado">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Fechado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Funções */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Funções
        </Label>
        <FuncaoMultiSelect
          selectedFuncoes={filtros.funcoes}
          onChange={handleFuncoesChange}
        />
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={onClear} variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
        <div className="text-sm text-muted-foreground flex items-center ml-auto">
          Use os filtros acima para refinar sua consulta
        </div>
      </div>
    </div>
  );
};

export default HistoricoFilters;