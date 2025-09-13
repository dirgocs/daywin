import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, DollarSign, Star, Award, Plus, Edit, Trash2, Save, X, Calendar, Target, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BonificacoesScreen = () => {
  const [bonificacoes, setBonificacoes] = useState([]);
  const [showNewBonusDialog, setShowNewBonusDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedTab, setSelectedTab] = useState('lista');

  // Form states para nova bonificação
  const [newBonusForm, setNewBonusForm] = useState({
    nome: '',
    descricao: '',
    tipo: 'fixo', // fixo, porcentagem, meta
    valor: '',
    condicao: 'manual', // manual, automatica
    criterio: '',
    validoAte: '',
    ativo: true
  });

  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalBonificacoes: 0,
    bonificacoesAtivas: 0,
    valorTotalMes: 0,
    metasAlcancadas: 0
  });

  // Mock data inicial
  useEffect(() => {
    setBonificacoes([
      {
        id: 1,
        nome: "Bônus de Pontualidade",
        descricao: "Bônus para diaristas que não atrasaram no mês",
        tipo: "fixo",
        valor: 50,
        condicao: "automatica",
        criterio: "pontuacao >= 95",
        validoAte: "2024-12-31",
        ativo: true,
        criadoEm: "2024-01-15",
        aplicacoes: 15,
        valorTotal: 750
      },
      {
        id: 2,
        nome: "Meta de Horas",
        descricao: "Bônus por atingir 160 horas/mês",
        tipo: "porcentagem",
        valor: 10,
        condicao: "automatica",
        criterio: "horas_mes >= 160",
        validoAte: "2024-06-30",
        ativo: true,
        criadoEm: "2024-01-20",
        aplicacoes: 8,
        valorTotal: 1200
      },
      {
        id: 3,
        nome: "Excelência no Atendimento",
        descricao: "Bônus por avaliações acima de 4.5",
        tipo: "fixo",
        valor: 100,
        condicao: "manual",
        criterio: "avaliacao >= 4.5",
        validoAte: "",
        ativo: false,
        criadoEm: "2024-02-01",
        aplicacoes: 3,
        valorTotal: 300
      }
    ]);

    // Calcular estatísticas
    setStats({
      totalBonificacoes: 26,
      bonificacoesAtivas: 2,
      valorTotalMes: 1950,
      metasAlcancadas: 23
    });
  }, []);

  const handleSaveBonus = () => {
    if (!newBonusForm.nome.trim() || !newBonusForm.valor) {
      alert('Nome e valor são obrigatórios');
      return;
    }

    const newBonus = {
      id: Date.now(),
      ...newBonusForm,
      valor: parseFloat(newBonusForm.valor),
      criadoEm: new Date().toISOString().split('T')[0],
      aplicacoes: 0,
      valorTotal: 0
    };

    if (editingItem) {
      setBonificacoes(prev => 
        prev.map(bonus => bonus.id === editingItem.id ? { ...newBonus, id: editingItem.id, aplicacoes: editingItem.aplicacoes, valorTotal: editingItem.valorTotal } : bonus)
      );
    } else {
      setBonificacoes(prev => [...prev, newBonus]);
    }

    setNewBonusForm({
      nome: '',
      descricao: '',
      tipo: 'fixo',
      valor: '',
      condicao: 'manual',
      criterio: '',
      validoAte: '',
      ativo: true
    });
    setEditingItem(null);
    setShowNewBonusDialog(false);
  };

  const handleEditBonus = (bonus) => {
    setNewBonusForm({
      nome: bonus.nome,
      descricao: bonus.descricao,
      tipo: bonus.tipo,
      valor: bonus.valor.toString(),
      condicao: bonus.condicao,
      criterio: bonus.criterio,
      validoAte: bonus.validoAte,
      ativo: bonus.ativo
    });
    setEditingItem(bonus);
    setShowNewBonusDialog(true);
  };

  const handleDeleteBonus = (id) => {
    if (confirm('Tem certeza que deseja excluir esta bonificação?')) {
      setBonificacoes(prev => prev.filter(bonus => bonus.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setBonificacoes(prev => 
      prev.map(bonus => 
        bonus.id === id ? { ...bonus, ativo: !bonus.ativo } : bonus
      )
    );
  };

  const getBonusTypeLabel = (tipo) => {
    const types = {
      'fixo': 'Valor Fixo',
      'porcentagem': 'Porcentagem',
      'meta': 'Meta'
    };
    return types[tipo] || tipo;
  };

  const getBonusConditionLabel = (condicao) => {
    const conditions = {
      'manual': 'Aplicação Manual',
      'automatica': 'Aplicação Automática'
    };
    return conditions[condicao] || condicao;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonificações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie bônus e incentivos para as diaristas
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Gift className="h-4 w-4" />
          {stats.bonificacoesAtivas} Ativas
        </Badge>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonificações</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBonificacoes}</div>
            <p className="text-xs text-muted-foreground">
              +3 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonificações Ativas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bonificacoesAtivas}</div>
            <p className="text-xs text-muted-foreground">
              De {bonificacoes.length} configuradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.valorTotalMes}</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação ao anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Alcançadas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metasAlcancadas}</div>
            <p className="text-xs text-muted-foreground">
              88% das metas estabelecidas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista de Bonificações</TabsTrigger>
          <TabsTrigger value="relatorio">Relatório de Aplicações</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Bonificações Configuradas
                </CardTitle>
                <Dialog open={showNewBonusDialog} onOpenChange={setShowNewBonusDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Bonificação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Editar Bonificação' : 'Nova Bonificação'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bonus-nome">Nome da Bonificação</Label>
                          <Input
                            id="bonus-nome"
                            value={newBonusForm.nome}
                            onChange={(e) => setNewBonusForm(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Bônus de Pontualidade"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo de Bonificação</Label>
                          <Select 
                            value={newBonusForm.tipo} 
                            onValueChange={(value) => setNewBonusForm(prev => ({ ...prev, tipo: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                              <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                              <SelectItem value="meta">Por Meta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bonus-descricao">Descrição</Label>
                        <Textarea
                          id="bonus-descricao"
                          value={newBonusForm.descricao}
                          onChange={(e) => setNewBonusForm(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descreva quando esta bonificação deve ser aplicada"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bonus-valor">
                            {newBonusForm.tipo === 'porcentagem' ? 'Percentual (%)' : 'Valor (R$)'}
                          </Label>
                          <Input
                            id="bonus-valor"
                            type="number"
                            step={newBonusForm.tipo === 'porcentagem' ? '0.1' : '0.01'}
                            min="0"
                            value={newBonusForm.valor}
                            onChange={(e) => setNewBonusForm(prev => ({ ...prev, valor: e.target.value }))}
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Condição de Aplicação</Label>
                          <Select 
                            value={newBonusForm.condicao} 
                            onValueChange={(value) => setNewBonusForm(prev => ({ ...prev, condicao: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Aplicação Manual</SelectItem>
                              <SelectItem value="automatica">Aplicação Automática</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {newBonusForm.condicao === 'automatica' && (
                        <div className="space-y-2">
                          <Label htmlFor="bonus-criterio">Critério para Aplicação Automática</Label>
                          <Input
                            id="bonus-criterio"
                            value={newBonusForm.criterio}
                            onChange={(e) => setNewBonusForm(prev => ({ ...prev, criterio: e.target.value }))}
                            placeholder="Ex: horas_mes >= 160 ou pontuacao >= 95"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use variáveis como: horas_mes, pontuacao, avaliacao, dias_trabalhados
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bonus-valido">Válido Até (Opcional)</Label>
                          <Input
                            id="bonus-valido"
                            type="date"
                            value={newBonusForm.validoAte}
                            onChange={(e) => setNewBonusForm(prev => ({ ...prev, validoAte: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <div className="flex items-center space-x-2 h-10">
                            <Switch
                              checked={newBonusForm.ativo}
                              onCheckedChange={(checked) => setNewBonusForm(prev => ({ ...prev, ativo: checked }))}
                            />
                            <span className="text-sm">
                              {newBonusForm.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveBonus} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          {editingItem ? 'Atualizar' : 'Criar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setNewBonusForm({
                              nome: '',
                              descricao: '',
                              tipo: 'fixo',
                              valor: '',
                              condicao: 'manual',
                              criterio: '',
                              validoAte: '',
                              ativo: true
                            });
                            setEditingItem(null);
                            setShowNewBonusDialog(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bonificacoes.map((bonus) => (
                  <div key={bonus.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{bonus.nome}</h4>
                        <Badge variant={bonus.ativo ? "default" : "secondary"}>
                          {bonus.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          {getBonusTypeLabel(bonus.tipo)}
                        </Badge>
                        <Badge variant="outline">
                          {bonus.tipo === 'porcentagem' ? `${bonus.valor}%` : `R$ ${bonus.valor.toFixed(2)}`}
                        </Badge>
                      </div>
                      
                      {bonus.descricao && (
                        <p className="text-sm text-muted-foreground mb-2">{bonus.descricao}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📊 {bonus.aplicacoes} aplicações</span>
                        <span>💰 R$ {bonus.valorTotal.toFixed(2)} total</span>
                        <span>🎯 {getBonusConditionLabel(bonus.condicao)}</span>
                        {bonus.validoAte && (
                          <span>📅 Até {new Date(bonus.validoAte).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={bonus.ativo ? "outline" : "default"}
                        onClick={() => handleToggleStatus(bonus.id)}
                      >
                        {bonus.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditBonus(bonus)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteBonus(bonus.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {bonificacoes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma bonificação configurada</p>
                    <p className="text-sm">Clique em "Nova Bonificação" para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Relatório de Aplicações - Último Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock data para relatório */}
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-800">Bônus de Pontualidade</h4>
                      <p className="text-sm text-green-600">15 aplicações este mês</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-800">R$ 750,00</p>
                      <p className="text-xs text-green-600">R$ 50,00 por aplicação</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-800">Meta de Horas</h4>
                      <p className="text-sm text-blue-600">8 aplicações este mês</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-800">R$ 1.200,00</p>
                      <p className="text-xs text-blue-600">10% sobre salário base</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-amber-800">Excelência no Atendimento</h4>
                      <p className="text-sm text-amber-600">3 aplicações este mês</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-amber-800">R$ 300,00</p>
                      <p className="text-xs text-amber-600">R$ 100,00 por aplicação</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Total de Bonificações no Mês:</span>
                  <span className="text-lg font-bold">R$ 2.250,00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonificacoesScreen;