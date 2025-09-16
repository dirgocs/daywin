import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const parseTime = (t) => {
  const m = String(t || '').match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
};

const Jornada = () => {
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('16:00');
  const [intervalDuration, setIntervalDuration] = useState('60');
  const [intervals, setIntervals] = useState([{ time: '12:00', duration: '60' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatHHMM = (raw) => {
    const digits = String(raw || '').replace(/[^0-9]/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  };

  const clampHHMM = (val) => {
    const m = String(val || '').match(/^(\d{2}):(\d{2})$/);
    if (!m) return val;
    let h = Math.min(23, Math.max(0, Number(m[1])));
    let mm = Math.min(59, Math.max(0, Number(m[2])));
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const TimeField = ({ value, onChange, invalid }) => {
    const [open, setOpen] = useState(false);
    const hoursRef = React.useRef(null);
    const minutesRef = React.useRef(null);
    const ROW_H = 32; // h-8
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const cur = String(value || '00:00');
    const curH = cur.slice(0, 2);
    const curM = cur.slice(3, 5);

    React.useEffect(() => {
      if (open) {
        try {
          const hIdx = Math.max(0, hours.indexOf(curH));
          const mIdx = Math.max(0, minutes.indexOf(curM));
          if (hoursRef.current) hoursRef.current.scrollTop = hIdx * ROW_H;
          if (minutesRef.current) minutesRef.current.scrollTop = mIdx * ROW_H;
        } catch {}
      }
    }, [open, curH, curM]);

    return (
      <div className="relative">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="HH:MM"
          value={value}
          onChange={(e)=> onChange(formatHHMM(e.target.value))}
          onBlur={()=> onChange(clampHHMM(formatHHMM(value)))}
          className={`pr-8 ${invalid ? 'border-destructive' : ''}`}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:bg-secondary"
              aria-label="Selecionar horário"
            >
              <Clock className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="p-2 w-[220px]">
            <div className="grid grid-cols-2 gap-2">
              <div ref={hoursRef} className="max-h-48 overflow-y-auto border rounded-md snap-y snap-mandatory scroll-smooth">
                {hours.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={()=> onChange(`${h}:${curM}`)}
                    className={`w-full text-left px-2 h-8 flex items-center text-sm snap-start hover:bg-accent hover:text-accent-foreground ${h===curH? 'bg-secondary': ''}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div ref={minutesRef} className="max-h-48 overflow-y-auto border rounded-md snap-y snap-mandatory scroll-smooth">
                {minutes.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={()=> { onChange(`${curH}:${m}`); setOpen(false); }}
                    className={`w-full text-left px-2 h-8 flex items-center text-sm snap-start hover:bg-accent hover:text-accent-foreground ${m===curM? 'bg-secondary': ''}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  useEffect(() => {
    async function load() {
      try {
        if (typeof window === 'undefined' || !window.electronAPI?.settings) return;
        const res = await window.electronAPI.settings.get('jornada');
        if (res?.success && res.data) {
          const cfg = JSON.parse(res.data);
          setStart(cfg.start || '08:00');
          setEnd(cfg.end || '16:00');
          setIntervalDuration(String(cfg.intervalDuration ?? '60'));
          setIntervals(Array.isArray(cfg.intervals) && cfg.intervals.length ? cfg.intervals : [{ time: '12:00', duration: String(cfg.intervalDuration ?? '60') }]);
        }
      } catch (e) {
        console.error('Erro ao carregar jornada:', e);
      }
    }
    load();
  }, []);

  const addInterval = () => {
    setIntervals(prev => [...prev, { time: '12:00', duration: intervalDuration || '60' }]);
  };

  const removeInterval = (idx) => {
    setIntervals(prev => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    try {
      setSaving(true); setError('');
      const s = parseTime(start); const e = parseTime(end);
      if (s === null || e === null) throw new Error('Horários de início e término inválidos.');
      const intervalsClean = intervals.map(it => ({ time: it.time, duration: String(Math.max(0, Number(it.duration || '0'))) }));
      const cfg = {
        start, end,
        intervalDuration: Number(intervalDuration || '0'),
        intervalCount: intervalsClean.length,
        intervals: intervalsClean,
      };
      if (typeof window === 'undefined' || !window.electronAPI?.settings) throw new Error('IPC settings indisponível');
      const res = await window.electronAPI.settings.set('jornada', JSON.stringify(cfg));
      if (!res?.success) throw new Error(res?.error || 'Falha ao salvar');
    } catch (e) {
      setError(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  // Cálculos: total da jornada (inclui intervalos) e horas trabalhadas (exclui intervalos)
  const toMin = (hhmm) => {
    const m = String(hhmm||'').match(/^(\d{2}):(\d{2})$/); if (!m) return null; return Number(m[1])*60+Number(m[2]);
  };
  const sMin = toMin(start); const eMin = toMin(end);
  const totalMin = sMin!=null && eMin!=null && eMin>sMin ? (eMin - sMin) : 0;
  const sumInt = intervals.reduce((acc,it)=> acc + Math.max(0, Number(it?.duration||0)), 0);
  const workedMin = Math.max(0, totalMin - sumInt);
  const formatHM = (mins) => {
    const m = Math.max(0, Math.round(mins||0));
    const h = Math.floor(m/60);
    const mm = m % 60;
    return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Jornada de Trabalho</CardTitle>
        <p className="text-sm text-muted-foreground">Defina as características abaixo referente à jornada de trabalho.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1) Primeira linha: início, término, tempo de intervalo padrão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Horário de Início (24h)</Label>
            <TimeField value={start} onChange={setStart} invalid={parseTime(start)==null} />
          </div>
          <div className="space-y-1">
            <Label>Horário de Término (24h)</Label>
            <TimeField value={end} onChange={setEnd} invalid={(parseTime(end)==null) || (parseTime(start)!=null && parseTime(end)<=parseTime(start))} />
          </div>
          <div className="space-y-1">
            <Label>Tempo de Intervalo Padrão (min)</Label>
            <Input type="number" min="0" value={intervalDuration} onChange={e=>setIntervalDuration(e.target.value)} />
          </div>
        </div>

        {/* 2) Segunda linha: botão adicionar intervalo */}
        <div className="flex items-center justify-start">
          <Button type="button" variant="outline" onClick={addInterval}><Plus className="h-4 w-4 mr-2" />Adicionar intervalo</Button>
        </div>

        {/* 3) Terceira linha: lista de intervalos vigentes */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-[12rem_10rem_auto] gap-2 text-sm text-muted-foreground">
            <div>Horário (24h)</div>
            <div>Duração (min)</div>
            <div></div>
          </div>
          <div className="space-y-2">
            {intervals.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[12rem_10rem_auto] gap-2 items-center">
                <TimeField
                  value={it.time}
                  onChange={(v)=> setIntervals(prev=>prev.map((p,i)=> i===idx?{...p,time:v}:p))}
                  invalid={parseTime(it.time)==null}
                />
                <Input type="number" min="0" value={it.duration} onChange={e=>setIntervals(prev=>prev.map((p,i)=> i===idx?{...p,duration:e.target.value}:p))} placeholder="min" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-black hover:text-white"
                  onClick={()=>removeInterval(idx)}
                  aria-label="Remover intervalo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 4) Resumo da jornada configurada */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Resumo da Jornada Configurada</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Duração total (inclui intervalos)</div>
              <div className="font-medium">{formatHM(totalMin)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Horas trabalhadas (exclui intervalos)</div>
              <div className="font-medium">{formatHM(workedMin)}</div>
            </div>
          </div>
        </div>

        {/* 5) Salvar */}
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="min-w-32">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Jornada;
