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
import { User, Phone, Mail, MapPin } from "lucide-react";

const DiaristaDialog = ({ isOpen, onClose, diarista = null, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    observacoes: '',
    status: 'ativo'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (diarista) {
      setFormData({
        nome: diarista.nome || '',
        telefone: diarista.telefone || '',
        email: diarista.email || '',
        endereco: diarista.endereco || '',
        observacoes: diarista.observacoes || '',
        status: diarista.status || 'ativo'
      });
    } else {
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        observacoes: '',
        status: 'ativo'
      });
    }
  }, [diarista, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const diaristaData = {
        ...formData,
        id: diarista?.id || Date.now(),
        dataCriacao: diarista?.dataCriacao || new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      onSave(diaristaData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar diarista:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!diarista;
  const isFormValid = formData.nome.trim() && formData.telefone.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Diarista' : 'Nova Diarista'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os dados da diarista abaixo'
              : 'Preencha os dados para cadastrar uma nova diarista'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Maria Silva"
                  required
                  lang="pt-BR"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="maria@email.com"
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua das Flores, 123 - Centro"
                lang="pt-BR"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre a diarista..."
                rows={3}
                lang="pt-BR"
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-2">
                <Badge variant={formData.status === 'ativo' ? 'default' : 'secondary'}>
                  {formData.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
                {diarista?.dataCriacao && (
                  <span className="text-sm text-muted-foreground">
                    Cadastrado em {new Date(diarista.dataCriacao).toLocaleDateString('pt-BR')}
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

export default DiaristaDialog;