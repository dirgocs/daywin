import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Calculator } from "lucide-react";
import { useFuncoes } from '../../../hooks/useFuncoes';

const HorasValorInput = ({ 
  horas, 
  setHoras, 
  valorDiaria, 
  setValorDiaria, 
  funcoesSelecionadas = [],
  calculoTipo = 'maior'
}) => {
  const [pontosCalculados, setPontosCalculados] = React.useState(0);
  
  // Carregar funções do banco de dados
  const { funcoes: availableFuncoes } = useFuncoes();
  const mockFuncoes = availableFuncoes;

  useEffect(() => {
    if (horas && funcoesSelecionadas.length > 0) {
      // Obter dados das funções selecionadas
      const funcoesData = funcoesSelecionadas.map(id => 
        mockFuncoes.find(f => f.id.toString() === id.toString())
      ).filter(Boolean);

      let multiplicador = 0;
      if (calculoTipo === 'maior') {
        // Usar apenas a função de maior pontuação
        multiplicador = Math.max(...funcoesData.map(f => f.pontos));
      } else {
        // Somar todas as funções
        multiplicador = funcoesData.reduce((total, f) => total + f.pontos, 0);
      }

      const pontos = parseFloat(horas) * multiplicador;
      setPontosCalculados(pontos);
    } else {
      setPontosCalculados(0);
    }
  }, [horas, funcoesSelecionadas, calculoTipo]);

  const handleHorasChange = (e) => {
    const value = e.target.value;
    setHoras(value);
    
    // Sugestão automática de valor baseado em horas padrão
    if (value && !valorDiaria) {
      const valorSugerido = parseFloat(value) * 25; // R$ 25/hora como padrão
      setValorDiaria(valorSugerido.toFixed(2));
    }
  };

  const handleValorChange = (e) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '');
    setValorDiaria(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          value={horas}
          onChange={handleHorasChange}
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
          value={valorDiaria}
          onChange={handleValorChange}
          className="text-right"
          lang="pt-BR"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Pontos Calculados
        </Label>
        <div className="flex h-10 items-center justify-center">
          <Badge variant="secondary" className="text-lg font-mono">
            {pontosCalculados.toFixed(1)} pts
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default HorasValorInput;