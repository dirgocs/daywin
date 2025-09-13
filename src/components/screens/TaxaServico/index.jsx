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
import { AlertTriangle, Calculator, DollarSign, Percent, Settings, Plus, Edit, Trash2, Save, X, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TaxaServicoScreen = () => {
  const [taxaAtual, setTaxaAtual] = useState(15); // 15% padrão
  const [tipoCalculo, setTipoCalculo] = useState('porcentagem');
  const [valorFixo, setValorFixo] = useState('');
  const [aplicarPorDiarista, setAplicarPorDiarista] = useState(false);
  const [taxasPersonalizadas, setTaxasPersonalizadas] = useState([]);
  const [regrasSazonais, setRegrasSazonais] = useState([]);
  const [showNewTaxaDialog, setShowNewTaxaDialog] = useState(false);
  const [showRegraDialog, setShowRegraDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states para nova taxa
  const [newTaxaForm, setNewTaxaForm] = useState({
    nome: '',
    valor: '',
    tipo: 'porcentagem',
    descricao: '',
    ativo: true
  });

  // Form states para nova regra sazonal
  const [newRegraForm, setNewRegraForm] = useState({
    nome: '',
    dataInicio: '',
    dataFim: '',
    multiplicador: 1.0,
    descricao: '',
    ativo: true
  });

  // Mock data inicial
  useEffect(() => {
    setTaxasPersonalizadas([
      {
        id: 1,
        nome: "Taxa Especial - Feriados",
        valor: 20,
        tipo: "porcentagem",
        descricao: "Taxa aplicada em feriados nacionais",
        ativo: true,
        criadoEm: "2024-01-15"
      },
      {
        id: 2,
        nome: "Taxa Fixa - Limpeza Pesada",
        valor: 50,
        tipo: "fixo",
        descricao: "Valor fixo para serviços de limpeza pesada",
        ativo: true,
        criadoEm: "2024-01-20"
      }
    ]);

    setRegrasSazonais([
      {
        id: 1,
        nome: "Fim de Ano",
        dataInicio: "2024-12-01",
        dataFim: "2024-12-31",
        multiplicador: 1.5,
        descricao: "Aumento sazonal para final de ano",
        ativo: true
      },
      {
        id: 2,
        nome: "Férias Escolares",
        dataInicio: "2024-07-01",
        dataFim: "2024-07-31",
        multiplicador: 1.2,
        descricao: "Aumento para período de férias",
        ativo: false
      }
    ]);
  }, []);

  const handleSaveTaxa = () => {
    if (!newTaxaForm.nome.trim() || !newTaxaForm.valor) {
      alert('Nome e valor são obrigatórios');
      return;
    }

    const newTaxa = {
      id: Date.now(),
      ...newTaxaForm,
      valor: parseFloat(newTaxaForm.valor),
      criadoEm: new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      setTaxasPersonalizadas(prev => 
        prev.map(taxa => taxa.id === editingItem.id ? { ...newTaxa, id: editingItem.id } : taxa)
      );
    } else {
      setTaxasPersonalizadas(prev => [...prev, newTaxa]);
    }

    setNewTaxaForm({ nome: '', valor: '', tipo: 'porcentagem', descricao: '', ativo: true });
    setEditingItem(null);
    setShowNewTaxaDialog(false);
  };

  const handleSaveRegra = () => {
    if (!newRegraForm.nome.trim() || !newRegraForm.dataInicio || !newRegraForm.dataFim) {
      alert('Nome, data de início e fim são obrigatórios');
      return;
    }

    const newRegra = {
      id: Date.now(),
      ...newRegraForm,
      multiplicador: parseFloat(newRegraForm.multiplicador)
    };

    if (editingItem) {
      setRegrasSazonais(prev => 
        prev.map(regra => regra.id === editingItem.id ? { ...newRegra, id: editingItem.id } : regra)
      );
    } else {
      setRegrasSazonais(prev => [...prev, newRegra]);
    }

    setNewRegraForm({ nome: '', dataInicio: '', dataFim: '', multiplicador: 1.0, descricao: '', ativo: true });
    setEditingItem(null);
    setShowRegraDialog(false);
  };

  const handleEditTaxa = (taxa) => {
    setNewTaxaForm({
      nome: taxa.nome,
      valor: taxa.valor.toString(),
      tipo: taxa.tipo,
      descricao: taxa.descricao,
      ativo: taxa.ativo
    });
    setEditingItem(taxa);
    setShowNewTaxaDialog(true);
  };

  const handleEditRegra = (regra) => {
    setNewRegraForm({
      nome: regra.nome,
      dataInicio: regra.dataInicio,
      dataFim: regra.dataFim,
      multiplicador: regra.multiplicador.toString(),
      descricao: regra.descricao,
      ativo: regra.ativo
    });
    setEditingItem(regra);
    setShowRegraDialog(true);
  };

  const handleDeleteTaxa = (id) => {
    if (confirm('Tem certeza que deseja excluir esta taxa personalizada?')) {
      setTaxasPersonalizadas(prev => prev.filter(taxa => taxa.id !== id));
    }
  };

  const handleDeleteRegra = (id) => {
    if (confirm('Tem certeza que deseja excluir esta regra sazonal?')) {
      setRegrasSazonais(prev => prev.filter(regra => regra.id !== id));
    }
  };

  const calcularExemplo = () => {
    const valorServico = 200; // Exemplo de R$ 200
    let taxa = 0;

    if (tipoCalculo === 'porcentagem') {
      taxa = (valorServico * taxaAtual) / 100;
    } else {
      taxa = parseFloat(valorFixo) || 0;
    }

    return {
      valorServico,
      taxa,
      valorFinal: valorServico + taxa
    };
  };

  const exemplo = calcularExemplo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Taxa de Serviço</h1>
          <p className="text-muted-foreground mt-2">
            Configure as taxas de serviço aplicadas sobre os valores das diárias
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações Ativas
        </Badge>
      </div>

      <Tabs defaultValue="configuracao" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuracao">Configuração Geral</TabsTrigger>
          <TabsTrigger value="taxas-personalizadas">Taxas Personalizadas</TabsTrigger>
          <TabsTrigger value="regras-sazonais">Regras Sazonais</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuração Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Configuração Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Cálculo</Label>
                  <Select value={tipoCalculo} onValueChange={setTipoCalculo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentagem">Porcentagem sobre valor</SelectItem>
                      <SelectItem value="fixo">Valor fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipoCalculo === 'porcentagem' ? (
                  <div className="space-y-2">
                    <Label htmlFor="taxa-percent" className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Taxa Padrão (%)
                    </Label>
                    <Input
                      id="taxa-percent"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={taxaAtual}
                      onChange={(e) => setTaxaAtual(parseFloat(e.target.value))}
                      className="text-right"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="taxa-fixa" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Fixo (R$)
                    </Label>
                    <Input
                      id="taxa-fixa"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorFixo}
                      onChange={(e) => setValorFixo(e.target.value)}
                      className="text-right"
                      placeholder="0,00"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aplicar Taxa Individual por Diarista</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite configurar taxas diferentes para cada diarista
                    </p>
                  </div>
                  <Switch
                    checked={aplicarPorDiarista}
                    onCheckedChange={setAplicarPorDiarista}
                  />
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Preview do Cálculo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Simulação de Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Exemplo de Aplicação:</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor do Serviço:</span>
                      <span className="font-mono">R$ {exemplo.valorServico.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Taxa de Serviço:</span>
                      <span className="font-mono text-blue-600">
                        {tipoCalculo === 'porcentagem' 
                          ? `${taxaAtual}% = R$ ${exemplo.taxa.toFixed(2)}`
                          : `R$ ${exemplo.taxa.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total a Pagar:</span>
                      <span className="font-mono text-lg">R$ {exemplo.valorFinal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {aplicarPorDiarista && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800">Taxa Individual Ativa</p>
                        <p className="text-amber-700">
                          Cada diarista poderá ter uma taxa específica configurada
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="taxas-personalizadas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Taxas Personalizadas
                </CardTitle>
                <Dialog open={showNewTaxaDialog} onOpenChange={setShowNewTaxaDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Taxa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Editar Taxa Personalizada' : 'Nova Taxa Personalizada'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxa-nome">Nome da Taxa</Label>
                        <Input
                          id="taxa-nome"
                          value={newTaxaForm.nome}
                          onChange={(e) => setNewTaxaForm(prev => ({ ...prev, nome: e.target.value }))}
                          placeholder="Ex: Taxa Especial Feriados"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select 
                            value={newTaxaForm.tipo} 
                            onValueChange={(value) => setNewTaxaForm(prev => ({ ...prev, tipo: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="porcentagem">Porcentagem</SelectItem>
                              <SelectItem value="fixo">Valor Fixo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxa-valor">
                            {newTaxaForm.tipo === 'porcentagem' ? 'Percentual (%)' : 'Valor (R$)'}
                          </Label>
                          <Input
                            id="taxa-valor"
                            type="number"
                            step={newTaxaForm.tipo === 'porcentagem' ? '0.1' : '0.01'}
                            min="0"
                            value={newTaxaForm.valor}
                            onChange={(e) => setNewTaxaForm(prev => ({ ...prev, valor: e.target.value }))}
                            className="text-right"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxa-descricao">Descrição</Label>
                        <Textarea
                          id="taxa-descricao"
                          value={newTaxaForm.descricao}
                          onChange={(e) => setNewTaxaForm(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição opcional da taxa"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Taxa Ativa</Label>
                        <Switch
                          checked={newTaxaForm.ativo}
                          onCheckedChange={(checked) => setNewTaxaForm(prev => ({ ...prev, ativo: checked }))}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveTaxa} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          {editingItem ? 'Atualizar' : 'Criar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setNewTaxaForm({ nome: '', valor: '', tipo: 'porcentagem', descricao: '', ativo: true });
                            setEditingItem(null);
                            setShowNewTaxaDialog(false);
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
                {taxasPersonalizadas.map((taxa) => (
                  <div key={taxa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{taxa.nome}</h4>
                        <Badge variant={taxa.ativo ? "default" : "secondary"}>
                          {taxa.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          {taxa.tipo === 'porcentagem' ? `${taxa.valor}%` : `R$ ${taxa.valor.toFixed(2)}`}
                        </Badge>
                      </div>
                      {taxa.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{taxa.descricao}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em {new Date(taxa.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTaxa(taxa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTaxa(taxa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {taxasPersonalizadas.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma taxa personalizada configurada</p>
                    <p className="text-sm">Clique em "Nova Taxa" para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regras-sazonais">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Regras Sazonais
                </CardTitle>
                <Dialog open={showRegraDialog} onOpenChange={setShowRegraDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Regra
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Editar Regra Sazonal' : 'Nova Regra Sazonal'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="regra-nome">Nome da Regra</Label>
                        <Input
                          id="regra-nome"
                          value={newRegraForm.nome}
                          onChange={(e) => setNewRegraForm(prev => ({ ...prev, nome: e.target.value }))}
                          placeholder="Ex: Fim de Ano"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="regra-inicio">Data de Início</Label>
                          <Input
                            id="regra-inicio"
                            type="date"
                            value={newRegraForm.dataInicio}
                            onChange={(e) => setNewRegraForm(prev => ({ ...prev, dataInicio: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="regra-fim">Data de Fim</Label>
                          <Input
                            id="regra-fim"
                            type="date"
                            value={newRegraForm.dataFim}
                            onChange={(e) => setNewRegraForm(prev => ({ ...prev, dataFim: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regra-multiplicador">Multiplicador</Label>
                        <Input
                          id="regra-multiplicador"
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={newRegraForm.multiplicador}
                          onChange={(e) => setNewRegraForm(prev => ({ ...prev, multiplicador: e.target.value }))}
                          className="text-right"
                          placeholder="1.0"
                        />
                        <p className="text-xs text-muted-foreground">
                          1.0 = sem alteração, 1.5 = +50%, 0.8 = -20%
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regra-descricao">Descrição</Label>
                        <Textarea
                          id="regra-descricao"
                          value={newRegraForm.descricao}
                          onChange={(e) => setNewRegraForm(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição opcional da regra"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Regra Ativa</Label>
                        <Switch
                          checked={newRegraForm.ativo}
                          onCheckedChange={(checked) => setNewRegraForm(prev => ({ ...prev, ativo: checked }))}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveRegra} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          {editingItem ? 'Atualizar' : 'Criar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setNewRegraForm({ nome: '', dataInicio: '', dataFim: '', multiplicador: 1.0, descricao: '', ativo: true });
                            setEditingItem(null);
                            setShowRegraDialog(false);
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
                {regrasSazonais.map((regra) => (
                  <div key={regra.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{regra.nome}</h4>
                        <Badge variant={regra.ativo ? "default" : "secondary"}>
                          {regra.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          {regra.multiplicador}x
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(regra.dataInicio).toLocaleDateString('pt-BR')} - {new Date(regra.dataFim).toLocaleDateString('pt-BR')}
                      </p>
                      {regra.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{regra.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditRegra(regra)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteRegra(regra.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {regrasSazonais.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma regra sazonal configurada</p>
                    <p className="text-sm">Clique em "Nova Regra" para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxaServicoScreen;