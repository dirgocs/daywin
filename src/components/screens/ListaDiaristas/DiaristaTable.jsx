import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  User,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DiaristaTable = ({ diaristas, onEdit, onDelete, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (diaristas.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma diarista cadastrada</h3>
        <p className="text-muted-foreground mb-4">
          Comece cadastrando sua primeira diarista no sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Estatísticas</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diaristas.map((diarista) => (
            <TableRow key={diarista.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{diarista.nome}</div>
                  {diarista.endereco && (
                    <div className="text-sm text-muted-foreground">
                      {diarista.endereco}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {diarista.telefone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {formatPhone(diarista.telefone)}
                    </div>
                  )}
                  {diarista.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {diarista.email}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <Badge 
                  variant={diarista.status === 'ativo' ? 'default' : 'secondary'}
                >
                  {diarista.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(diarista.dataCriacao)}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">
                      {diarista.totalDiasTrabalhados || 0}
                    </span>
                    <span className="text-muted-foreground ml-1">dias</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">
                      R$ {(diarista.totalGanhos || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </span>
                    <span className="text-muted-foreground ml-1">total</span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(diarista)}>
                      <User className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(diarista)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(diarista)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DiaristaTable;