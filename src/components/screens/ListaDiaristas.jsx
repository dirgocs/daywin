import React from 'react';
import ListaDiaristasManager from './ListaDiaristas/ListaDiaristasManager';

const ListaDiaristas = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lista de Diaristas</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as diaristas cadastradas.
        </p>
      </div>
      
      <ListaDiaristasManager />
    </div>
  );
};

export default ListaDiaristas;
