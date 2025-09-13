import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MessageSquare } from "lucide-react";

const DataObservacaoInput = ({ data, setData, observacoes, setObservacoes, showDate = true, dateLabel = 'Data do Trabalho' }) => {
  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {showDate && (
        <div className="space-y-2">
          <Label htmlFor="data" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {dateLabel}
          </Label>
          <Input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            max={hoje}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="observacoes" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Observações (opcional)
        </Label>
        <Textarea
          id="observacoes"
          placeholder="Descreva detalhes sobre o trabalho realizado, ocorrências, etc."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          lang="pt-BR"
        />
      </div>
    </div>
  );
};

export default DataObservacaoInput;
