import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

const DiaristaSelector = ({ value, onChange, diaristas = [] }) => {
  // Mock data - em produção viria do banco de dados
  const mockDiaristas = [
    { id: 1, nome: "Maria Silva", ativo: true },
    { id: 2, nome: "Ana Costa", ativo: true },
    { id: 3, nome: "João Santos", ativo: false },
    { id: 4, nome: "Paula Oliveira", ativo: true },
  ];

  const diaristasList = diaristas.length > 0 ? diaristas : mockDiaristas;

  return (
    <div className="space-y-2">
      <Label htmlFor="diarista" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Diarista
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma diarista" />
        </SelectTrigger>
        <SelectContent>
          {diaristasList
            .filter(d => d.ativo)
            .map((diarista) => (
              <SelectItem key={diarista.id} value={diarista.id.toString()}>
                {diarista.nome}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DiaristaSelector;