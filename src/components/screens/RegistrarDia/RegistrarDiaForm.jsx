import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, RotateCcw, CheckCircle, Calendar as CalendarIcon, DollarSign, Clock, Calculator } from "lucide-react";
import DiaristaSelector from './DiaristaSelector';
import FuncaoSelector from './FuncaoSelector';
import DataObservacaoInput from './DataObservacaoInput';
import { useFuncoes } from '@/hooks/useFuncoes';

const RegistrarDiaForm = () => {
  const [formData, setFormData] = useState({
    diaristaId: '',
    funcoesSelecionadas: [],
    // Sem cálculo de múltiplas funções: apenas uma função selecionada
    data: new Date().toISOString().split('T')[0],
    horas: '',
    valorDiaria: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [valorEdited, setValorEdited] = useState(false);

  // Carregar funções do DB e mapear selecionadas
  const { funcoes: availableFuncoes } = useFuncoes();
  const funcoesAtivas = useMemo(() => availableFuncoes.filter(f => f.ativo), [availableFuncoes]);
  const funcoesData = useMemo(() => (
    formData.funcoesSelecionadas
      .map(id => funcoesAtivas.find(f => String(f.id) === String(id)))
      .filter(Boolean)
  ), [formData.funcoesSelecionadas, funcoesAtivas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call - em produção seria uma chamada real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calcular pontos baseado na função única selecionada
      const multiplicador = funcoesData[0]?.pontos || 0;

      console.log('Dados do formulário:', {
        ...formData,
        funcoesSelecionadasData: funcoesData,
        pontosCalculados: formData.horas ? parseFloat(formData.horas) * multiplicador : 0
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleReset();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      diaristaId: '',
      funcoesSelecionadas: [],
      data: new Date().toISOString().split('T')[0],
      horas: '',
      valorDiaria: '',
      observacoes: ''
    });
    setValorEdited(false);
  };

  const isFormValid = formData.diaristaId && formData.funcoesSelecionadas.length > 0 && 
                     formData.data && formData.horas && formData.valorDiaria;

  // Handlers para campos separados
  const handleHorasChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, horas: value }));
  };

  const handleValorChange = (e) => {
    const raw = e.target.value;
    const value = raw.replace(/[^0-9.,]/g, '');
    setValorEdited(value.trim() !== '');
    setFormData(prev => ({ ...prev, valorDiaria: value }));
  };

  // Multiplicador efetivo com base nas funções selecionadas e tipo de cálculo
  const effectiveMultiplier = useMemo(() => {
    if (funcoesData.length === 0) return 0;
    if (formData.funcoesSelecionadas.length > 1) {
      if (formData.calculoTipo === 'maior') {
        return Math.max(...funcoesData.map(f => f.pontos));
      }
      if (formData.calculoTipo === 'primeira') {
        return funcoesData[0]?.pontos ?? 0;
      }
      return funcoesData.reduce((sum, f) => sum + f.pontos, 0);
    }
    return funcoesData[0]?.pontos ?? 0;
  }, [funcoesData, formData.funcoesSelecionadas.length, formData.calculoTipo]);

  // Auto-preencher valor da diária com base na função (mantendo campo editável)
  useEffect(() => {
    const horas = parseFloat(String(formData.horas || '').replace(',', '.'));
    if (!valorEdited && !Number.isNaN(horas) && horas > 0) {
      const baseHora = 25; // base/hora padrão
      const mult = effectiveMultiplier || 1;
      const sugestao = horas * baseHora * mult;
      setFormData(prev => ({ ...prev, valorDiaria: sugestao.toFixed(2) }));
    }
  }, [effectiveMultiplier, formData.horas, valorEdited]);

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Dia registrado com sucesso!
          </h2>
          <p className="text-muted-foreground text-center">
            O dia trabalhado foi salvo e os pontos foram calculados automaticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="[&_input]:shadow-none [&_textarea]:shadow-none [&_button[role=combobox]]:shadow-none [&_button]:shadow-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1a linha: Diarista, Dia Trabalhado, Valor da diária */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DiaristaSelector
              value={formData.diaristaId}
              onChange={(value) => setFormData(prev => ({ ...prev, diaristaId: value }))}
            />
            <div className="space-y-2">
              <Label htmlFor="data" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Dia Trabalhado
              </Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horas Trabalhadas
              </Label>
              <Input
                id="horas"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="8.0"
                value={formData.horas}
                onChange={handleHorasChange}
                className="text-right"
              />
            </div>
          </div>

          {/* 2a linha: Função exercida (maior), Peso + Valor lado a lado (compactos) */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6">
            <FuncaoSelector
              selectedFuncoes={formData.funcoesSelecionadas}
              onChange={(funcoes, tipo = 'maior') => setFormData(prev => ({ 
                ...prev, 
                funcoesSelecionadas: funcoes,
                calculoTipo: tipo
              }))}
              showCalculationInline={false}
            />
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="space-y-2">
                <Label htmlFor="peso" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Peso da Função (x)
                </Label>
                <Input
                  id="peso"
                  type="text"
                  readOnly
                  value={(() => {
                    if (funcoesData.length === 0) return '';
                    const pontosMaior = Math.max(...funcoesData.map(f => f.pontos), 0);
                    const pontosSoma = funcoesData.reduce((total, f) => total + f.pontos, 0);
                    const pontosPrimeira = funcoesData[0]?.pontos ?? 0;
                    const efetivo = formData.funcoesSelecionadas.length > 1
                      ? (formData.calculoTipo === 'maior' 
                          ? pontosMaior 
                          : formData.calculoTipo === 'primeira' 
                            ? pontosPrimeira 
                            : pontosSoma)
                      : (funcoesData[0]?.pontos ?? 0);
                    return `${Number(efetivo).toFixed(1)}x`;
                  })()}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor da Diária (R$)
                </Label>
                <Input
                  id="valor"
                  type="text"
                  placeholder="200,00"
                  value={formData.valorDiaria}
                  onChange={handleValorChange}
                  className="text-right"
                  lang="pt-BR"
                />
              </div>
            </div>
          </div>

          {/* Removido: cálculo de múltiplas funções (apenas uma função pode ser escolhida) */}

          {/* 4a linha: Observações */}
          <DataObservacaoInput
            data={formData.data}
            setData={(data) => setFormData(prev => ({ ...prev, data }))}
            observacoes={formData.observacoes}
            setObservacoes={(obs) => setFormData(prev => ({ ...prev, observacoes: obs }))}
            showDate={false}
          />

          {isFormValid && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Resumo do Registro:</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Funções: {funcoesData.map(f => f.nome).join(', ')}
                  </Badge>
                  <Badge variant="outline">
                    Valor: R$ {formData.valorDiaria}
                  </Badge>
                  <Badge variant="outline">
                    Horas: {formData.horas}h
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Pontos: {(() => {
                      if (funcoesData.length === 0) return '0';
                      const multiplicador = funcoesData[0]?.pontos || 0;
                      return (parseFloat(formData.horas || 0) * multiplicador).toFixed(1);
                    })()}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Dia
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrarDiaForm;
