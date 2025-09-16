import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, RotateCcw, CheckCircle, Calendar as CalendarIcon, DollarSign, Clock, Calculator } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import DiaristaSelector from './DiaristaSelector';
import FuncaoSelector from './FuncaoSelector';
import DataObservacaoInput from './DataObservacaoInput';
import { useFuncoes } from '@/hooks/useFuncoes';

const RegistrarDiaForm = () => {
  const [formData, setFormData] = useState({
    diaristasIds: [],
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
  const [jornadaCompleta, setJornadaCompleta] = useState(true);
  const [jornadaHoras, setJornadaHoras] = useState(8);
  const dateInputRef = useRef(null);
  const hiddenDateInputRef = useRef(null);

  const isoToDisplay = (iso) => {
    try {
      if (!iso) return '';
      const d = parse(iso, 'yyyy-MM-dd', new Date());
      return isValidDate(d) ? format(d, 'dd/MM/yyyy') : '';
    } catch { return ''; }
  };
  const displayToIso = (txt) => {
    try {
      const d = parse(txt, 'dd/MM/yyyy', new Date());
      return isValidDate(d) ? format(d, 'yyyy-MM-dd') : null;
    } catch { return null; }
  };
  const [dateDisplay, setDateDisplay] = useState(isoToDisplay(new Date().toISOString().split('T')[0]));

  // Carregar jornada padrão das configurações
  useEffect(() => {
    async function loadJornada() {
      try {
        if (typeof window === 'undefined' || !window.electronAPI?.settings) return;
        const res = await window.electronAPI.settings.get('jornada');
        if (res?.success && res.data) {
          const cfg = JSON.parse(res.data);
          const toMin = (hhmm) => {
            const m = String(hhmm||'').match(/^(\d{2}):(\d{2})$/); if (!m) return null; return Number(m[1])*60+Number(m[2]);
          };
          const s = toMin(cfg.start); const e = toMin(cfg.end);
          if (s!=null && e!=null && e>s) {
            let minutes = e - s;
            const intervals = Array.isArray(cfg.intervals) ? cfg.intervals : [];
            const sumInt = intervals.reduce((acc,it)=> acc + Math.max(0, Number(it?.duration||0)), 0);
            minutes = Math.max(0, minutes - sumInt);
            setJornadaHoras(Math.max(0, minutes/60));
          }
        }
      } catch(e) { /* ignore, manter 8h */ }
    }
    loadJornada();
  }, []);

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
      // Persistir um registro para cada diarista selecionado
      if (typeof window === 'undefined' || !window.electronAPI?.dias) {
        throw new Error('IPC dias indisponível');
      }
      const funcaoId = formData.funcoesSelecionadas[0] ? Number(formData.funcoesSelecionadas[0]) : null;
      const horas = jornadaCompleta
        ? jornadaHoras
        : (parseFloat(String(formData.horas).replace(',', '.')) || 0);
      const valor = parseFloat(String(formData.valorDiaria).replace(',', '.')) || 0;
      for (const did of formData.diaristasIds) {
        await window.electronAPI.dias.create({
          data: formData.data,
          diarista_id: Number(did),
          funcao_id: funcaoId,
          horas_trabalhadas: horas,
          diaria_valor: valor,
          observacoes: formData.observacoes || null,
        });
      }

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
      diaristasIds: [],
      funcoesSelecionadas: [],
      data: new Date().toISOString().split('T')[0],
      horas: '',
      valorDiaria: '',
      observacoes: ''
    });
    setValorEdited(false);
  };

  const hasDiaristas = Array.isArray(formData.diaristasIds) && formData.diaristasIds.length > 0;
  const hasFuncao = Array.isArray(formData.funcoesSelecionadas) && formData.funcoesSelecionadas.length > 0;
  const hasDate = (() => {
    if (formData.data) return true;
    const v = String(dateDisplay || '');
    return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
  })();
  const hasHoras = jornadaCompleta || String(formData.horas ?? '').trim() !== '';
  const hasValor = String(formData.valorDiaria ?? '').trim() !== '';
  const isFormValid = hasDiaristas && hasFuncao && hasDate && hasHoras && hasValor;

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
              values={formData.diaristasIds}
              onChange={(values) => setFormData(prev => ({ ...prev, diaristasIds: values }))}
            />
            <div className="space-y-2">
              <Label htmlFor="data" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Dia Trabalhado
              </Label>
              <div className="relative">
                {/* Visible, formatted input */}
                <Input
                  id="data"
                  type="text"
                  ref={dateInputRef}
                  value={dateDisplay}
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9/]/g, '');
                    setDateDisplay(v);
                  }}
                  onBlur={() => {
                    const iso = displayToIso(dateDisplay);
                    if (iso) {
                      setFormData(prev => ({ ...prev, data: iso }));
                      setDateDisplay(isoToDisplay(iso));
                    } else {
                      // revert to last valid
                      setDateDisplay(isoToDisplay(formData.data));
                    }
                  }}
                  className="pr-10"
                />
                {/* Hidden native date input for picker */}
                <input
                  type="date"
                  ref={hiddenDateInputRef}
                  value={formData.data}
                  onChange={(e) => {
                    const iso = e.target.value;
                    setFormData(prev => ({ ...prev, data: iso }));
                    setDateDisplay(isoToDisplay(iso));
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden={true}
                />
                <button
                  type="button"
                  aria-label="Abrir calendário"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 h-6 w-6 flex items-center justify-center text-muted-foreground opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
                  onClick={() => {
                    const el = hiddenDateInputRef.current;
                    if (!el) return;
                    if (typeof el.showPicker === 'function') {
                      try { el.showPicker(); return; } catch {}
                    }
                    el.focus();
                    el.click();
                  }}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Jornada Completa
              </Label>
              <div className="flex items-center gap-3">
                <Switch checked={jornadaCompleta} onCheckedChange={setJornadaCompleta} />
                <span className="text-sm text-muted-foreground">{jornadaCompleta ? 'Usar jornada padrão' : 'Informar horas manualmente'}</span>
              </div>
              {!jornadaCompleta && (
                <div className="pt-2">
                  <Label htmlFor="horas" className="sr-only">Horas Trabalhadas</Label>
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
              )}
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
                    Funções: {funcoesData.map(f => f.funcao_nome).join(', ')}
                  </Badge>
                  <Badge variant="outline">
                    Valor: R$ {formData.valorDiaria}
                  </Badge>
                  <Badge variant="outline">Horas: {jornadaCompleta ? `${jornadaHoras}h` : `${formData.horas || 0}h`}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Pontos: {(() => {
                      if (funcoesData.length === 0) return '0';
                      const multiplicador = funcoesData[0]?.pontos || 0;
                      const jornadaPadraoHoras = 8; // TODO: ler das configurações
                      const h = jornadaCompleta ? jornadaHoras : parseFloat(formData.horas || 0);
                      return (h * multiplicador).toFixed(1);
                    })()}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Button 
              type="submit" 
              className="w-full"
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
            {/* Removido feedback textual de campos faltantes */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrarDiaForm;
