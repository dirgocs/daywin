import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useFuncoes } from '../../../hooks/useFuncoes';

const FuncaoMultiSelect = ({ selectedFuncoes = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Carregar funções do banco de dados
  const { funcoes: availableFuncoes } = useFuncoes();

  // Obter funções selecionadas com seus dados
  const funcoesData = selectedFuncoes.map(id => 
    availableFuncoes.find(f => f.id.toString() === id.toString())
  ).filter(Boolean);

  // Filtrar sugestões baseado no input
  const filteredSuggestions = availableFuncoes.filter(funcao => 
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

  const handleSelectFuncao = (funcaoId) => {
    if (!selectedFuncoes.includes(funcaoId)) {
      const newSelectedFuncoes = [...selectedFuncoes, funcaoId];
      onChange(newSelectedFuncoes);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveFuncao = (funcaoId) => {
    const newSelectedFuncoes = selectedFuncoes.filter(id => id !== funcaoId);
    onChange(newSelectedFuncoes);
  };

  return (
    <div className="space-y-2">
      {/* Input com autocomplete */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Digite para buscar funções..."
          lang="pt-BR"
        />
        
        {/* Sugestões de autocomplete */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
            <div className="max-h-40 overflow-y-auto">
              {filteredSuggestions.map((funcao) => (
                <div
                  key={funcao.id}
                  className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                  onClick={() => handleSelectFuncao(funcao.id.toString())}
                >
                  <span>{funcao.funcao_nome}</span>
                  <span className="text-sm text-muted-foreground">({funcao.pontos}x)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tags das funções selecionadas */}
      {funcoesData.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {funcoesData.map((funcao) => (
            <Badge key={funcao.id} variant="secondary" className="gap-1 pr-1">
              <span>{funcao.funcao_nome}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveFuncao(funcao.id.toString())}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {selectedFuncoes.length === 0 && (
        <div className="text-sm text-muted-foreground">
          Todas as funções serão incluídas
        </div>
      )}
    </div>
  );
};

export default FuncaoMultiSelect;