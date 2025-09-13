import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  UserCheck,
  UserX,
  TrendingUp
} from "lucide-react";
import DiaristaTable from './DiaristaTable';
import DiaristaDialog from './DiaristaDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ListaDiaristasManager = () => {
  const [diaristas, setDiaristas] = useState([]);
  const [filteredDiaristas, setFilteredDiaristas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDiarista, setSelectedDiarista] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - em produção viria do banco
  const mockDiaristas = [
    {
      id: 1,
      nome: 'Maria Silva',
      telefone: '11999999999',
      email: 'maria@email.com',
      endereco: 'Rua das Flores, 123 - Centro',
      status: 'ativo',
      dataCriacao: '2024-01-15T00:00:00.000Z',
      dataAtualizacao: '2024-01-15T00:00:00.000Z',
      totalDiasTrabalhados: 45,
      totalGanhos: 9500.00,
      observacoes: 'Diarista muito dedicada'
    },
    {
      id: 2,
      nome: 'Ana Costa',
      telefone: '11888888888',
      email: 'ana@email.com',
      endereco: 'Av. Principal, 456 - Vila Nova',
      status: 'ativo',
      dataCriacao: '2024-02-10T00:00:00.000Z',
      dataAtualizacao: '2024-02-10T00:00:00.000Z',
      totalDiasTrabalhados: 32,
      totalGanhos: 6800.00,
      observacoes: ''
    },
    {
      id: 3,
      nome: 'Paula Oliveira',
      telefone: '11777777777',
      email: '',
      endereco: 'Rua do Campo, 789',
      status: 'inativo',
      dataCriacao: '2023-12-05T00:00:00.000Z',
      dataAtualizacao: '2024-03-01T00:00:00.000Z',
      totalDiasTrabalhados: 12,
      totalGanhos: 2400.00,
      observacoes: 'Afastada temporariamente'
    }
  ];

  useEffect(() => {
    // Simular carregamento dos dados
    const loadDiaristas = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDiaristas(mockDiaristas);
      setLoading(false);
    };

    loadDiaristas();
  }, []);

  useEffect(() => {
    let filtered = diaristas;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(diarista =>
        diarista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diarista.telefone.includes(searchTerm) ||
        diarista.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(diarista => diarista.status === statusFilter);
    }

    setFilteredDiaristas(filtered);
  }, [diaristas, searchTerm, statusFilter]);

  const handleNewDiarista = () => {
    setSelectedDiarista(null);
    setIsDialogOpen(true);
  };

  const handleEditDiarista = (diarista) => {
    setSelectedDiarista(diarista);
    setIsDialogOpen(true);
  };

  const handleDeleteDiarista = async (diarista) => {
    if (window.confirm(`Tem certeza que deseja excluir ${diarista.nome}?`)) {
      // Mock deletion - em produção seria uma API call
      setDiaristas(prev => prev.filter(d => d.id !== diarista.id));
    }
  };

  const handleViewDetails = (diarista) => {
    console.log('Ver detalhes da diarista:', diarista);
    // Implementar modal/página de detalhes
  };

  const handleSaveDiarista = (diaristaData) => {
    if (selectedDiarista) {
      // Atualizar diarista existente
      setDiaristas(prev => prev.map(d => 
        d.id === selectedDiarista.id ? { ...diaristaData, id: selectedDiarista.id } : d
      ));
    } else {
      // Adicionar nova diarista
      setDiaristas(prev => [...prev, diaristaData]);
    }
  };

  // Estatísticas
  const stats = {
    total: diaristas.length,
    ativas: diaristas.filter(d => d.status === 'ativo').length,
    inativas: diaristas.filter(d => d.status === 'inativo').length,
    totalGanhos: diaristas.reduce((sum, d) => sum + (d.totalGanhos || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando diaristas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inativas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalGanhos.toLocaleString('pt-BR', {
                minimumFractionDigits: 2
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Ativos
                </div>
              </SelectItem>
              <SelectItem value="inativo">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Inativos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleNewDiarista}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Diarista
        </Button>
      </div>

      {/* Resultados */}
      {searchTerm || statusFilter !== 'todos' ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredDiaristas.length} de {diaristas.length} diaristas
          </span>
          {searchTerm && (
            <Badge variant="outline">
              Busca: "{searchTerm}"
            </Badge>
          )}
          {statusFilter !== 'todos' && (
            <Badge variant="outline">
              Status: {statusFilter}
            </Badge>
          )}
        </div>
      ) : null}

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Diaristas</CardTitle>
          <CardDescription>
            Gerencie todas as diaristas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiaristaTable
            diaristas={filteredDiaristas}
            onEdit={handleEditDiarista}
            onDelete={handleDeleteDiarista}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Dialog para criar/editar */}
      <DiaristaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        diarista={selectedDiarista}
        onSave={handleSaveDiarista}
      />
    </div>
  );
};

export default ListaDiaristasManager;