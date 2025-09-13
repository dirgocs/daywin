import React from 'react';
import RegistrarDiaForm from './RegistrarDia/RegistrarDiaForm';

const RegistrarDia = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Dia Trabalhado</h1>
        <p className="text-muted-foreground">
          Registre os dias trabalhados pelos diaristas com horas e valores.
        </p>
      </div>
      
      <RegistrarDiaForm />
    </div>
  );
};

export default RegistrarDia;
