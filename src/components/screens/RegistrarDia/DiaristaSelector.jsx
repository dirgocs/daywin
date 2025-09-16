import React, { useEffect, useRef, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CadastroDiarista from "@/components/CadastroDiarista";

const DiaristaSelector = ({ values = [], onChange, diaristas }) => {
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const safeValues = Array.isArray(values)
    ? values.map((v) => String(v))
    : values
    ? [String(values)]
    : [];
  const selectedList = list.filter((d) => safeValues.includes(String(d.id)));
  const [addOpen, setAddOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qNome, setQNome] = useState("");
  const [qTelefone, setQTelefone] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (Array.isArray(diaristas) && diaristas.length) {
      setList(diaristas);
    }
  }, [diaristas]);

  useEffect(() => {
    async function fetchDiaristas() {
      try {
        if (typeof window === 'undefined' || !window.electronAPI?.diaristas) {
          setLoadError('IPC indisponível: não foi possível carregar as diaristas.');
          return;
        }
        const result = await window.electronAPI.diaristas.findAll();
        if (result?.success) {
          const mapped = (result.data || []).map((d) => ({
            id: d.diarista_id ?? d.id,
            nome: d.nome_completo ?? d.nome ?? d.apelido ?? '',
            ativo: typeof d.ativo === 'boolean' ? d.ativo : true,
          }));
          setList(mapped);
          setLoadError('');
        } else {
          setLoadError(`Falha ao carregar diaristas${result?.error ? `: ${result.error}` : ''}`);
        }
      } catch (e) {
        console.error('Erro ao carregar diaristas:', e);
        setLoadError('Erro ao carregar diaristas. Verifique a conexão com o processo principal.');
      }
    }
    fetchDiaristas();
  }, []);

  const filtered = list.filter(d => d.ativo && d.nome.toLowerCase().includes(inputValue.toLowerCase()));

  const handleSelect = (id) => {
    const sid = String(id);
    const next = safeValues.includes(sid) ? safeValues : [...safeValues, sid];
    onChange(next);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemove = (id) => {
    const sid = String(id);
    onChange(safeValues.filter((v) => String(v) !== sid));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCreate = async (name) => {
    const clean = (name || '').trim();
    if (!clean) return;
    try {
      if (typeof window === 'undefined' || !window.electronAPI?.diaristas) {
        alert('IPC indisponível: não foi possível criar a diarista.');
        return;
      }
      const result = await window.electronAPI.diaristas.create({ nome_completo: clean, ativo: true });
      if (result?.success && result.data) {
        const d = result.data;
        const id = d.diarista_id ?? d.id;
        const nome = d.nome_completo ?? clean;
        setList(prev => [...prev, { id, nome, ativo: true }]);
        handleSelect(id);
      } else {
        alert(`Falha ao criar diarista${result?.error ? `: ${result.error}` : ''}`);
      }
    } catch (e) {
      console.error('Erro ao criar diarista:', e);
      alert('Erro ao criar diarista. Verifique o console para detalhes.');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="diarista" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Diarista
      </Label>
      <div className="relative">
        <div
          className="min-h-9 w-full rounded-md border border-input bg-background px-2 py-1 pr-10 text-sm flex flex-wrap items-center gap-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring"
          onClick={() => inputRef.current?.focus()}
        >
          {selectedList.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1">
              <span className="truncate max-w-[12rem] px-2 py-0 rounded-md bg-muted text-foreground">{s.nome}</span>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => { e.stopPropagation(); handleRemove(s.id); }}
                aria-label={`Remover ${s.nome}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
            onFocus={() => { if (inputValue.length > 0) setShowSuggestions(true); }}
            onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && filtered.length > 0) { e.preventDefault(); handleSelect(filtered[0].id); } }}
            placeholder={selectedList.length ? "Adicionar diarista" : "Digite para buscar diarista..."}
            className="flex-1 min-w-[8rem] bg-transparent outline-none border-0 h-7"
            lang="pt-BR"
          />
        </div>
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Adicionar diarista"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 h-6 w-6 flex items-center justify-center text-muted-foreground opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" sideOffset={2} onOpenAutoFocus={(e)=>e.preventDefault()} className="w-[28rem] max-w-[90vw] p-3 text-sm shadow-none">
            <div className="space-y-3">
              <div>
                <Label htmlFor="qnome">Nome completo</Label>
                <Input id="qnome" value={qNome} onChange={(e)=>setQNome(e.target.value)} placeholder="Digite o nome completo" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qtel">Telefone</Label>
                  <Input id="qtel" value={qTelefone} onChange={(e)=>setQTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <Label htmlFor="qmail">E-mail</Label>
                  <Input id="qmail" type="email" value={qEmail} onChange={(e)=>setQEmail(e.target.value)} placeholder="email@exemplo.com" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <Button
                  type="button"
                  className="h-8"
                  onClick={async ()=>{
                    const nome = qNome.trim();
                    if(!nome) return;
                    try{
                      if (typeof window !== 'undefined' && window.electronAPI?.diaristas) {
                        const result = await window.electronAPI.diaristas.create({ nome_completo: nome, telefone: qTelefone || null, email: qEmail || null, ativo: true });
                        if (result?.success && result.data){
                          const d = result.data;
                          const id = d.diarista_id ?? d.id;
                          const display = d.nome_completo ?? nome;
                          setList(prev=>[...prev, { id, nome: display, ativo: true }]);
                          const sid = String(id);
                          const next = safeValues.includes(sid) ? safeValues : [...safeValues, sid];
                          onChange(next);
                        }
                      } else {
                        const id = Date.now();
                        setList(prev=>[...prev, { id, nome, ativo: true }]);
                        const sid = String(id);
                        const next = safeValues.includes(sid) ? safeValues : [...safeValues, sid];
                        onChange(next);
                      }
                    }catch(err){
                      console.error('Erro ao criar diarista (rápido):', err);
                    } finally {
                      setAddOpen(false);
                      setQNome(""); setQTelefone(""); setQEmail("");
                    }
                  }}
                >
                  Salvar
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="h-8">Cadastro completo…</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[42rem] max-w-[90vw] max-h-[80vh] overflow-y-auto">
                    <CadastroDiarista
                      onBack={() => setDialogOpen(false)}
                      onCreated={(d)=>{
                        const id = d?.diarista_id ?? d?.id;
                        const nome = d?.nome_completo ?? d?.nome ?? '';
                        if (id) {
                          setList(prev => {
                            const exists = prev.some(x => String(x.id) === String(id));
                            return exists ? prev : [...prev, { id, nome, ativo: true }];
                          });
                          const sid = String(id);
                          const next = safeValues.includes(sid) ? safeValues : [...safeValues, sid];
                          onChange(next);
                        }
                        setDialogOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {showSuggestions && filtered.length > 0 && (
          <div className="absolute left-0 top-full mt-[2px] z-50 rounded-md border bg-popover p-2 text-popover-foreground text-xs w-auto min-w-[16rem] max-w-[22rem]">
            {filtered.map((d) => {
              const fullName = d.nome || '';
              const isTruncated = fullName.length > 30;
              const displayName = isTruncated ? `${fullName.slice(0, 30).trimEnd()}...` : fullName;
              return (
                <button
                  type="button"
                  key={d.id}
                  className="w-full rounded-sm px-1.5 py-1.5 text-left cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center"
                  onClick={() => handleSelect(d.id)}
                >
                  <span title={isTruncated ? fullName : undefined} className={`truncate max-w-[14rem] px-2 py-0.5 rounded-md bg-muted text-foreground`}>{displayName}</span>
                </button>
              );
            })}
            {filtered.length === 0 && inputValue.trim() && (
              <button type="button" className="w-full rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground" onClick={() => handleCreate(inputValue.trim())}>
                Criar diarista "{inputValue.trim()}"
              </button>
            )}
          </div>
        )}
      </div>
      {loadError && (
        <div className="text-xs text-destructive mt-1">{loadError}</div>
      )}
    </div>
  );
};

export default DiaristaSelector;
