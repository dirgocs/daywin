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
import { Minus, DollarSign, AlertTriangle, Clock, Plus, Edit, Trash2, Save, X, Calendar, TrendingDown, FileX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DescontosScreen = () => {
  const [descontos, setDescontos] = useState([]);
  const [showNewDiscountDialog, setShowNewDiscountDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedTab, setSelectedTab] = useState('lista');

  // Form states para novo desconto
  const [newDiscountForm, setNewDiscountForm] = useState({
    nome: '',
    descricao: '',
    tipo: 'fixo', // fixo, porcentagem
    valor: '',
    categoria: 'disciplinar', // disciplinar, administrativa, legal, outros
    aplicacao: 'manual', // manual, automatica
    justificativa: '',
    validoAte: '',
    ativo: true
  });

  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalDescontos: 0,
    descontosAtivos: 0,
    valorTotalMes: 0,
    aplicacoesMes: 0
  });

  // Mock data inicial
  useEffect(() => {
    setDescontos([
      {
        id: 1,
        nome: "Atraso sem Justificativa",
        descricao: "Desconto por atraso superior a 15 minutos sem justificativa",
        tipo: "fixo",
        valor: 25,
        categoria: "disciplinar",
        aplicacao: "manual",
        justificativa: "Políticas de pontualidade da empresa",
        validoAte: "",
        ativo: true,
        criadoEm: "2024-01-15",
        aplicacoes: 5,
        valorTotal: 125
      },
      {
        id: 2,
        nome: "Falta não Comunicada",
        descricao: "Desconto por falta sem comunicação prévia",
        tipo: "porcentagem",
        valor: 10,
        categoria: "disciplinar",
        aplicacao: "automatica",
        justificativa: "Política de comunicação obrigatória",
        validoAte: "2024-12-31",
        ativo: true,
        criadoEm: "2024-01-20",
        aplicacoes: 2,
        valorTotal: 180
      },
      {
        id: 3,
        nome: "Dano ao Material",
        descricao: "Desconto por danos a equipamentos ou materiais",
        tipo: "fixo",
        valor: 100,
        categoria: "administrativa",
        aplicacao: "manual",
        justificativa: "Reposição de material danificado",
        validoAte: "",
        ativo: true,
        criadoEm: "2024-02-01",
        aplicacoes: 1,
        valorTotal: 100
      },
      {
        id: 4,
        nome: "Imposto de Renda",
        descricao: "Desconto automático do imposto de renda",
        tipo: "porcentagem",
        valor: 7.5,
        categoria: "legal",
        aplicacao: "automatica",
        justificativa: "Obrigação legal - IR na fonte",
        validoAte: "",
        ativo: false,
        criadoEm: "2024-01-10",
        aplicacoes: 15,
        valorTotal: 450
      }
    ]);

    // Calcular estatísticas
    setStats({
      totalDescontos: 23,
      descontosAtivos: 3,
      valorTotalMes: 855,
      aplicacoesMes: 23
    });
  }, []);

  const handleSaveDiscount = () => {
    if (!newDiscountForm.nome.trim() || !newDiscountForm.valor) {
      alert('Nome e valor são obrigatórios');
      return;
    }

    const newDiscount = {
      id: Date.now(),
      ...newDiscountForm,
      valor: parseFloat(newDiscountForm.valor),
      criadoEm: new Date().toISOString().split('T')[0],
      aplicacoes: 0,
      valorTotal: 0
    };

    if (editingItem) {
      setDescontos(prev => 
        prev.map(discount => discount.id === editingItem.id ? { ...newDiscount, id: editingItem.id, aplicacoes: editingItem.aplicacoes, valorTotal: editingItem.valorTotal } : discount)
      );
    } else {
      setDescontos(prev => [...prev, newDiscount]);
    }

    setNewDiscountForm({
      nome: '',
      descricao: '',
      tipo: 'fixo',
      valor: '',
      categoria: 'disciplinar',
      aplicacao: 'manual',
      justificativa: '',
      validoAte: '',
      ativo: true
    });
    setEditingItem(null);
    setShowNewDiscountDialog(false);
  };

  const handleEditDiscount = (discount) => {
    setNewDiscountForm({
      nome: discount.nome,
      descricao: discount.descricao,
      tipo: discount.tipo,
      valor: discount.valor.toString(),
      categoria: discount.categoria,
      aplicacao: discount.aplicacao,
      justificativa: discount.justificativa,
      validoAte: discount.validoAte,
      ativo: discount.ativo
    });
    setEditingItem(discount);
    setShowNewDiscountDialog(true);
  };

  const handleDeleteDiscount = (id) => {
    if (confirm('Tem certeza que deseja excluir este desconto?')) {
      setDescontos(prev => prev.filter(discount => discount.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setDescontos(prev => 
      prev.map(discount => 
        discount.id === id ? { ...discount, ativo: !discount.ativo } : discount
      )
    );
  };

  const getDiscountTypeLabel = (tipo) => {
    const types = {
      'fixo': 'Valor Fixo',
      'porcentagem': 'Porcentagem'
    };
    return types[tipo] || tipo;
  };

  const getDiscountCategoryLabel = (categoria) => {
    const categories = {
      'disciplinar': 'Disciplinar',
      'administrativa': 'Administrativa', 
      'legal': 'Legal/Fiscal',
      'outros': 'Outros'
    };
    return categories[categoria] || categoria;
  };

  const getDiscountApplicationLabel = (aplicacao) => {
    const applications = {
      'manual': 'Aplicação Manual',
      'automatica': 'Aplicação Automática'
    };
    return applications[aplicacao] || aplicacao;
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'disciplinar': 'bg-red-50 text-red-700 border-red-200',
      'administrativa': 'bg-blue-50 text-blue-700 border-blue-200',
      'legal': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'outros': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[categoria] || colors['outros'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Descontos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie descontos aplicáveis nos pagamentos das diaristas
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Minus className="h-4 w-4" />
          {stats.descontosAtivos} Ativos
        </Badge>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Descontos</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDescontos}</div>
            <p className="text-xs text-muted-foreground">
              +1 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descontos Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.descontosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              De {descontos.length} configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-R$ {stats.valorTotalMes}</div>
            <p className="text-xs text-muted-foreground">
              -5% em relação ao anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicações Mês</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aplicacoesMes}</div>
            <p className="text-xs text-muted-foreground">
              Aplicações realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista de Descontos</TabsTrigger>
          <TabsTrigger value="relatorio">Relatório de Aplicações</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileX className="h-5 w-5" />
                  Descontos Configurados
                </CardTitle>
                <Dialog open={showNewDiscountDialog} onOpenChange={setShowNewDiscountDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Desconto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Editar Desconto' : 'Novo Desconto'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-nome">Nome do Desconto</Label>
                          <Input
                            id="discount-nome"
                            value={newDiscountForm.nome}
                            onChange={(e) => setNewDiscountForm(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Atraso sem Justificativa"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select 
                            value={newDiscountForm.categoria} 
                            onValueChange={(value) => setNewDiscountForm(prev => ({ ...prev, categoria: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="disciplinar">Disciplinar</SelectItem>
                              <SelectItem value="administrativa">Administrativa</SelectItem>
                              <SelectItem value="legal">Legal/Fiscal</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount-descricao">Descrição</Label>
                        <Textarea
                          id="discount-descricao"
                          value={newDiscountForm.descricao}
                          onChange={(e) => setNewDiscountForm(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descreva quando este desconto deve ser aplicado"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Desconto</Label>
                          <Select 
                            value={newDiscountForm.tipo} 
                            onValueChange={(value) => setNewDiscountForm(prev => ({ ...prev, tipo: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                              <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount-valor">
                            {newDiscountForm.tipo === 'porcentagem' ? 'Percentual (%)' : 'Valor (R$)'}
                          </Label>
                          <Input
                            id="discount-valor"
                            type="number"
                            step={newDiscountForm.tipo === 'porcentagem' ? '0.1' : '0.01'}
                            min="0"
                            value={newDiscountForm.valor}
                            onChange={(e) => setNewDiscountForm(prev => ({ ...prev, valor: e.target.value }))}
                            className="text-right"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount-justificativa">Justificativa Legal/Administrativa</Label>
                        <Textarea
                          id="discount-justificativa"
                          value={newDiscountForm.justificativa}
                          onChange={(e) => setNewDiscountForm(prev => ({ ...prev, justificativa: e.target.value }))}
                          placeholder="Justificativa para aplicação do desconto (obrigatório para registros)"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Aplicação</Label>
                          <Select 
                            value={newDiscountForm.aplicacao} 
                            onValueChange={(value) => setNewDiscountForm(prev => ({ ...prev, aplicacao: value }))}
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

                        <div className="space-y-2">
                          <Label htmlFor="discount-valido">Válido Até (Opcional)</Label>
                          <Input
                            id="discount-valido"
                            type="date"
                            value={newDiscountForm.validoAte}
                            onChange={(e) => setNewDiscountForm(prev => ({ ...prev, validoAte: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newDiscountForm.ativo}
                            onCheckedChange={(checked) => setNewDiscountForm(prev => ({ ...prev, ativo: checked }))}
                          />
                          <span className="text-sm">
                            {newDiscountForm.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveDiscount} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          {editingItem ? 'Atualizar' : 'Criar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setNewDiscountForm({
                              nome: '',
                              descricao: '',
                              tipo: 'fixo',
                              valor: '',
                              categoria: 'disciplinar',
                              aplicacao: 'manual',
                              justificativa: '',
                              validoAte: '',
                              ativo: true
                            });
                            setEditingItem(null);
                            setShowNewDiscountDialog(false);
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
                {descontos.map((discount) => (
                  <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{discount.nome}</h4>
                        <Badge variant={discount.ativo ? "default" : "secondary"}>
                          {discount.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge className={getCategoryColor(discount.categoria)}>
                          {getDiscountCategoryLabel(discount.categoria)}
                        </Badge>
                        <Badge variant="outline">
                          {getDiscountTypeLabel(discount.tipo)}
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          -{discount.tipo === 'porcentagem' ? `${discount.valor}%` : `R$ ${discount.valor.toFixed(2)}`}
                        </Badge>
                      </div>
                      
                      {discount.descricao && (
                        <p className="text-sm text-muted-foreground mb-2">{discount.descricao}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📊 {discount.aplicacoes} aplicações</span>
                        <span>💰 R$ {discount.valorTotal.toFixed(2)} total</span>
                        <span>⚙️ {getDiscountApplicationLabel(discount.aplicacao)}</span>
                        {discount.validoAte && (
                          <span>📅 Até {new Date(discount.validoAte).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>

                      {discount.justificativa && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Justificativa: {discount.justificativa}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={discount.ativo ? "outline" : "default"}
                        onClick={() => handleToggleStatus(discount.id)}
                      >
                        {discount.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditDiscount(discount)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteDiscount(discount.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {descontos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Minus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum desconto configurado</p>
                    <p className="text-sm">Clique em "Novo Desconto" para começar</p>
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
                <TrendingDown className="h-5 w-5" />
                Relatório de Aplicações - Último Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock data para relatório */}
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-800">Atraso sem Justificativa</h4>
                      <p className="text-sm text-red-600">5 aplicações este mês</p>
                      <p className="text-xs text-red-500">Categoria: Disciplinar</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-800">-R$ 125,00</p>
                      <p className="text-xs text-red-600">R$ 25,00 por aplicação</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-800">Falta não Comunicada</h4>
                      <p className="text-sm text-red-600">2 aplicações este mês</p>
                      <p className="text-xs text-red-500">Categoria: Disciplinar</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-800">-R$ 180,00</p>
                      <p className="text-xs text-red-600">10% sobre salário base</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-800">Dano ao Material</h4>
                      <p className="text-sm text-blue-600">1 aplicação este mês</p>
                      <p className="text-xs text-blue-500">Categoria: Administrativa</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-800">-R$ 100,00</p>
                      <p className="text-xs text-blue-600">R$ 100,00 por aplicação</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-yellow-800">Imposto de Renda</h4>
                      <p className="text-sm text-yellow-600">15 aplicações este mês</p>
                      <p className="text-xs text-yellow-500">Categoria: Legal/Fiscal</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-yellow-800">-R$ 450,00</p>
                      <p className="text-xs text-yellow-600">7.5% sobre salário bruto</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <span className="font-medium text-red-800">Total de Descontos no Mês:</span>
                  <span className="text-lg font-bold text-red-800">-R$ 855,00</span>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Observações Importantes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Descontos disciplinares requerem justificativa e documentação</li>
                    <li>• Descontos legais são aplicados automaticamente conforme legislação</li>
                    <li>• Todo desconto deve ter aprovação e registro de motivo</li>
                    <li>• Valores são deduzidos do pagamento mensal da diarista</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DescontosScreen;