import React, { useState, useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, Calculator, Crown, X, Tag, GripVertical, Check, MoreHorizontal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFuncoes } from '../../../hooks/useFuncoes';

const FuncaoSelector = ({ selectedFuncoes = [], onChange, funcoes = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [manageList, setManageList] = useState([]);
  const [dragId, setDragId] = useState(null);
  const inputRef = useRef(null);
  
  // Usar hook para carregar funções do banco de dados
  const { 
    funcoes: availableFuncoes, 
    loading, 
    createFuncao, 
    checkNameExists,
    updateFuncao,
    updateOrder,
  } = useFuncoes();

  // Paleta de cores para as "pílulas" (texto colorido)
  const chipColors = {
    default: "bg-muted text-foreground",
    gray: "bg-gray-200 text-gray-800",
    darkgray: "bg-gray-700 text-gray-50",
    brown: "bg-amber-700 text-amber-50",
    orange: "bg-orange-200 text-orange-900",
    yellow: "bg-yellow-200 text-yellow-900",
    green: "bg-green-200 text-green-900",
    blue: "bg-blue-200 text-blue-900",
    purple: "bg-purple-200 text-purple-900",
    pink: "bg-pink-200 text-pink-900",
    red: "bg-red-200 text-red-900",
  };

  const funcoesList = funcoes.length > 0 ? funcoes : availableFuncoes;
  const funcoesAtivas = funcoesList.filter(f => f.ativo);

  // Inicializa/atualiza lista de gerenciamento quando abre o popover ou quando mudar lista de funções
  useEffect(() => {
    setManageList(funcoesAtivas.map(f => ({ id: f.id, funcao_nome: f.funcao_nome, color: f.color || 'default' })));
  }, [managementOpen, funcoesAtivas.length]);

  // Obter funções selecionadas com seus dados
  const funcoesData = selectedFuncoes.map(id => 
    funcoesAtivas.find(f => f.id.toString() === id.toString())
  ).filter(Boolean);

  // Filtrar sugestões baseado no input
  const filteredSuggestions = funcoesAtivas.filter(funcao => 
    funcao.funcao_nome.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedFuncoes.includes(funcao.id.toString())
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        handleSelectFuncao(filteredSuggestions[0].id.toString());
      }
    }
  };

  const handleSelectFuncao = (funcaoId) => {
    // Single select: substitui a seleção
    if (!(selectedFuncoes.length === 1 && selectedFuncoes[0] === funcaoId)) {
      onChange([funcaoId]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveFuncao = (funcaoId) => {
    const newSelectedFuncoes = selectedFuncoes.filter(id => id !== funcaoId);
    onChange(newSelectedFuncoes);
  };

  const handleCreateNewFuncao = async (name) => {
    const cleanName = name?.trim();
    if (!cleanName) return;
    try {
      const nameExists = await checkNameExists(cleanName);
      if (nameExists) {
        alert('Já existe uma função com este nome');
        return;
      }

      const newFuncao = await createFuncao({
        funcao_nome: cleanName,
        pontos: 1.0,
        ativo: true,
        color: 'default',
      });

      // Atualiza lista e auto-seleciona
      setManageList(prev => [...prev, { id: newFuncao.id, funcao_nome: newFuncao.funcao_nome, color: 'default' }]);
      handleSelectFuncao(newFuncao.id.toString());
      setSearchTerm('');
    } catch (error) {
      console.error('Erro ao criar função:', error);
      alert('Erro ao criar função: ' + error.message);
    }
  };

  // Drag and drop handlers
  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = async (targetId) => {
    if (dragId === null || dragId === targetId) return;
    const updated = [...manageList];
    const from = updated.findIndex(i => i.id === dragId);
    const to = updated.findIndex(i => i.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setManageList(updated);
    setDragId(null);
    // Persist ordering
    try {
      const payload = updated.map((item, idx) => ({ id: item.id, ordem: idx + 1 }));
      await updateOrder(payload);
    } catch (e) { console.error('Falha ao salvar ordem das funções:', e); }
  };

  // Actions: rename, delete, setColor
  const setColor = async (id, color) => {
    setManageList(prev => prev.map(item => item.id === id ? { ...item, color } : item));
    try { await updateFuncao(id, { color }); } catch {}
  };
  // Removidos: rename/delete do menu de opções (serão tratados em outra área do app)

  // Calcular pontos auxiliares
  const pontosTotais = funcoesData.reduce((total, f) => total + f.pontos, 0);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Funções Exercidas
      </Label>
      
      <div className="space-y-2">
        {/* Input com chips dentro + ícone de configurações */}
        <div className="relative">
            <div
              className="h-9 w-full rounded-md border border-input bg-background px-2 py-0 pr-10 text-sm flex flex-wrap items-center gap-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring"
              onClick={() => inputRef.current?.focus()}
            >
              {funcoesData.map((funcao) => {
                const fullName = funcao.funcao_nome || '';
                const isTruncated = fullName.length > 30;
                const displayName = isTruncated ? `${fullName.slice(0, 30).trimEnd()}...` : fullName;
                const colorClass = chipColors[funcao.color] || chipColors.default;
                return (
                  <span key={funcao.id} className="inline-flex items-center gap-1">
                    {isTruncated ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`truncate max-w-[10rem] px-2 py-0 rounded-md ${colorClass}`}>{displayName}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">{fullName}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className={`truncate max-w-[10rem] px-2 py-0 rounded-md ${colorClass}`}>{displayName}</span>
                    )}
                    <button
                      type="button"
                      className="rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => { e.stopPropagation(); handleRemoveFuncao(funcao.id.toString()); }}
                      aria-label={`Remover ${fullName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                placeholder={funcoesData.length === 0 ? "Digite para buscar funções..." : "Adicionar função"}
                className="flex-1 min-w-[8rem] bg-transparent outline-none border-0 h-7"
                lang="pt-BR"
              />
            </div>
            <Popover open={managementOpen} onOpenChange={setManagementOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Gerenciar funções"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 h-6 w-6 flex items-center justify-center text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <Tag className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 text-xs">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="buscar-funcao" className="text-xs">Buscar Função</Label>
                    <Input
                      id="buscar-funcao"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Digite o nome da função"
                      autoFocus
                      className="h-8 border-border text-[11px] placeholder:text-[11px] placeholder:text-muted-foreground/80"
                    />
                  </div>

                  {/* Lista reordenável como badges */}
                  <div className="max-h-56 overflow-y-auto w-full">
                    {(() => {
                      const filtered = manageList.filter(f =>
                        f.funcao_nome.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        const trimmed = searchTerm.trim();
                        return (
                          <div className="p-2">
                            {trimmed ? (
                              <Button
                                onClick={() => handleCreateNewFuncao(trimmed)}
                                className="w-full h-8 text-xs"
                                variant="outline"
                              >
                                Criar função "{trimmed}"
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">Nenhuma função encontrada</span>
                            )}
                          </div>
                        );
                      }
                      // Usa chipColors do escopo do componente
                      return (
                        <div className="flex flex-col gap-1">
                          {filtered.map((f, idx) => {
                            const isSelected = selectedFuncoes.includes(f.id.toString());
                            const colorClass = chipColors[f.color] || chipColors.default;
                            const fullName = f.funcao_nome || '';
                            const isTruncated = fullName.length > 30;
                            const displayName = isTruncated ? `${fullName.slice(0, 30).trimEnd()}...` : fullName;
                            return (
                              <div
                                key={f.id}
                                className="group cursor-move select-none rounded-md hover:bg-muted/40 px-1 py-0.5"
                                draggable
                                onDragStart={() => onDragStart(f.id)}
                                onDragOver={onDragOver}
                                onDrop={() => onDrop(f.id)}
                              >
                                <div className="flex items-center gap-[3px] w-full">
                                  <GripVertical className="h-3.5 w-3.5 opacity-60" />
                                  <Badge
                                    variant="outline"
                                    className={`justify-start px-0 py-0 text-[11px] bg-transparent border-transparent ${isSelected ? 'opacity-60' : 'cursor-pointer hover:brightness-95'}`}
                                    title={isSelected ? 'Já selecionada' : 'Clique para adicionar'}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                      if (!isSelected) handleSelectFuncao(f.id.toString())
                                    }}
                                    onKeyDown={(e) => {
                                      if (isSelected) return;
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSelectFuncao(f.id.toString());
                                      }
                                    }}
                                  >
                                    {isTruncated ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className={`px-2 py-0.5 rounded-md ${colorClass}`}>{displayName}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start">
                                          {fullName}
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span className={`px-2 py-0.5 rounded-md ${colorClass}`}>{displayName}</span>
                                    )}
                                    {isSelected && <Check className="h-3.5 w-3.5 ml-auto opacity-70" />}
                                  </Badge>
                                  <div className="flex-1" />
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="rounded-md p-1 ml-[5px] opacity-0 group-hover:opacity-100 focus:opacity-100 transition hover:bg-muted/60">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" sideOffset={2} className="min-w-40">
                                      {Object.keys(chipColors)
                                        .filter((key) => key !== 'gray')
                                        .map((key) => (
                                          <DropdownMenuItem key={key} onClick={() => setColor(f.id, key)}>
                                            <span className={`mr-2 inline-block size-3 rounded-[3px] border border-border/50 ${chipColors[key].split(' ').find(c=>c.startsWith('bg-'))}`}></span>
                                            {key === 'default'
                                              ? 'Gray (default)'
                                              : key === 'darkgray'
                                              ? 'Dark Gray'
                                              : key.charAt(0).toUpperCase() + key.slice(1)}
                                          </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {/* Sugestões dentro do container relativo, alinhadas ao field */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-[2px] z-50 rounded-md border bg-popover p-2 text-popover-foreground text-xs w-auto min-w-[16rem] max-w-[22rem]">
                {filteredSuggestions.map((funcao) => {
                  const fullName = funcao.funcao_nome || '';
                  const isTruncated = fullName.length > 30;
                  const displayName = isTruncated ? `${fullName.slice(0, 30).trimEnd()}...` : fullName;
                  const colorClass = chipColors[funcao.color] || chipColors.default;
                  return (
                    <button
                      type="button"
                      key={funcao.id}
                      className="w-full rounded-sm px-1.5 py-1.5 text-left cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center"
                      onClick={() => handleSelectFuncao(funcao.id.toString())}
                    >
                      {isTruncated ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`truncate max-w-[14rem] px-2 py-0.5 rounded-md ${colorClass}`}>{displayName}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">{fullName}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className={`truncate max-w-[14rem] px-2 py-0.5 rounded-md ${colorClass}`}>{displayName}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* dropdown de sugestões foi movido para dentro do container relativo acima */}
          {false && showSuggestions && filteredSuggestions.length > 0 && <div />}

        {/* Chips agora ficam dentro do campo acima */}
      </div>

      {/* Removido: cálculo para múltiplas funções (modo single-select) */}
      {false && selectedFuncoes.length > 1 && (
        <Card className="border-amber-200 bg-amber-50/50 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Cálculo de Pontos - Múltiplas Funções
            </CardTitle>
            <CardDescription>
              Como deseja calcular os pontos para múltiplas funções?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue="primeira"
              onValueChange={(value) => onChange(selectedFuncoes, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maior" id="maior" />
                <Label htmlFor="maior" className="flex items-center gap-2 cursor-pointer">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="font-medium">Maior pontuação</div>
                    <div className="text-sm text-muted-foreground">
                      Usar apenas a função de maior valor ({maiorPontuacao}x pontos)
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="primeira" id="primeira" />
                <Label htmlFor="primeira" className="flex items-center gap-2 cursor-pointer">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Pontuação da primeira função escolhida</div>
                    <div className="text-sm text-muted-foreground">
                      Usar os pontos da primeira função selecionada ({primeiraPontuacao}x pontos)
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {false && selectedFuncoes.length === 1 && (
        <div className="text-sm text-muted-foreground">
          <Badge variant="secondary">
            {funcoesData[0]?.pontos}x pontos - {funcoesData[0]?.funcao_nome}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default FuncaoSelector;
