import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Calculator, Zap } from "lucide-react";

const FuncaoDialog = ({ isOpen, onClose, funcao = null, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    pontos: '',
    descricao: '',
    status: 'ativo'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (funcao) {
      setFormData({
        nome: funcao.nome || '',
        pontos: funcao.pontos?.toString() || '',
        descricao: funcao.descricao || '',
        status: funcao.status || 'ativo'
      });
    } else {
      setFormData({
        nome: '',
        pontos: '',
        descricao: '',
        status: 'ativo'
      });
    }
  }, [funcao, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const funcaoData = {
        ...formData,
        pontos: parseFloat(formData.pontos),
        id: funcao?.id || Date.now(),
        dataCriacao: funcao?.dataCriacao || new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      onSave(funcaoData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar função:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!funcao;
  const isFormValid = formData.nome.trim() && formData.pontos && 
                     !isNaN(parseFloat(formData.pontos)) && 
                     parseFloat(formData.pontos) > 0;

  // Função para determinar a cor do badge baseado nos pontos
  const getPontosVariant = (pontos) => {
    const p = parseFloat(pontos);
    if (p >= 2.0) return 'destructive'; // Vermelho para pontos altos
    if (p >= 1.5) return 'default'; // Azul para pontos médio-altos
    if (p >= 1.0) return 'secondary'; // Cinza para pontos normais
    return 'outline'; // Outline para pontos baixos
  };

  const getPontosDescription = (pontos) => {
    const p = parseFloat(pontos);
    if (p >= 2.0) return 'Função muito complexa';
    if (p >= 1.5) return 'Função complexa';
    if (p >= 1.0) return 'Função normal';
    if (p >= 0.5) return 'Função simples';
    return 'Função muito simples';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isEditing ? 'Editar Função' : 'Nova Função'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os dados da função abaixo'
              : 'Crie uma nova função de trabalho com seu multiplicador de pontos'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Nome da Função *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Limpeza Geral"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pontos" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Multiplicador de Pontos *
                </Label>
                <Input
                  id="pontos"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={formData.pontos}
                  onChange={(e) => setFormData(prev => ({ ...prev, pontos: e.target.value }))}
                  placeholder="1.0"
                  required
                />
              </div>
            </div>

            {/* Preview dos pontos */}
            {formData.pontos && !isNaN(parseFloat(formData.pontos)) && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Exemplo de cálculo:</span>
                  </div>
                  <Badge variant={getPontosVariant(formData.pontos)}>
                    {getPontosDescription(formData.pontos)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  8 horas × {formData.pontos} pontos = <strong>{(8 * parseFloat(formData.pontos)).toFixed(1)} pontos totais</strong>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Ativo
                    </div>
                  </SelectItem>
                  <SelectItem value="inativo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Inativo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva as atividades incluídas nesta função..."
                rows={3}
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-2">
                <Badge variant={formData.status === 'ativo' ? 'default' : 'secondary'}>
                  {formData.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
                {funcao?.dataCriacao && (
                  <span className="text-sm text-muted-foreground">
                    Criado em {new Date(funcao.dataCriacao).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid || loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Salvando...
                </>
              ) : (
                isEditing ? 'Atualizar' : 'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FuncaoDialog;