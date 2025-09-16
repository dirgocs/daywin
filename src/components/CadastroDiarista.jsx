import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, User, Mail, Phone, MapPin, X } from 'lucide-react';

const CadastroDiarista = ({ onBack, onCreated }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    nacionalidade: '',
    naturalidadeCidade: '',
    naturalidadeEstado: '',
    telefone: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    banco: '',
    agencia: '',
    conta: '',
    chavePix: '',
    tipoSanguineo: '',
    planoSaude: [],
    alergias: []
  });

  const [newPlanoSaude, setNewPlanoSaude] = useState('');
  const [newAlergia, setNewAlergia] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = (field, value, setter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeTag = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const buscarCEP = async (cep) => {
    if (cep.length === 8 || cep.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome_completo: formData.nome?.trim() || '',
        telefone: formData.telefone?.trim() || null,
        email: formData.email?.trim() || null,
        ativo: true,
      };
      let created = null;
      if (typeof window !== 'undefined' && window.electronAPI?.diaristas) {
        const result = await window.electronAPI.diaristas.create(payload);
        if (result?.success) created = result.data;
      }
      if (onCreated && created) onCreated(created);
    } catch (err) {
      console.error('Erro ao cadastrar diarista:', err);
    } finally {
      onBack && onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Cadastro de Diarista</h1>
      </div>
      
      <div className="w-full">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 shadow-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="dados-pessoais" className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start p-1 text-muted-foreground bg-transparent">
              <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="dados-bancarios">Dados Bancários</TabsTrigger>
              <TabsTrigger value="dados-saude">Dados de Saúde</TabsTrigger>
            </TabsList>
            
            {/* Tab: Dados Pessoais */}
            <TabsContent value="dados-pessoais" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Digite o nome completo"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nacionalidade">Nacionalidade</Label>
                  <Input
                    id="nacionalidade"
                    name="nacionalidade"
                    type="text"
                    value={formData.nacionalidade}
                    onChange={handleInputChange}
                    placeholder="País de origem"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="naturalidadeCidade">Naturalidade - Cidade</Label>
                  <Input
                    id="naturalidadeCidade"
                    name="naturalidadeCidade"
                    type="text"
                    value={formData.naturalidadeCidade}
                    onChange={handleInputChange}
                    placeholder="Cidade de nascimento"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="naturalidadeEstado">Naturalidade - Estado</Label>
                  <Input
                    id="naturalidadeEstado"
                    name="naturalidadeEstado"
                    type="text"
                    value={formData.naturalidadeEstado}
                    onChange={handleInputChange}
                    placeholder="Estado de nascimento"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                    className="dw-input"
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Tab: Endereço */}
            <TabsContent value="endereco" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      name="cep"
                      type="text"
                      value={formData.cep}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                      className="dw-input"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => buscarCEP(formData.cep)}
                      className="shadow-none"
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    name="rua"
                    type="text"
                    value={formData.rua}
                    onChange={handleInputChange}
                    placeholder="Nome da rua"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    name="numero"
                    type="text"
                    value={formData.numero}
                    onChange={handleInputChange}
                    placeholder="Número"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    name="complemento"
                    type="text"
                    value={formData.complemento}
                    onChange={handleInputChange}
                    placeholder="Apto, bloco, etc."
                    className="dw-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    type="text"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    placeholder="Nome do bairro"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    type="text"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Nome da cidade"
                    className="dw-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    name="estado"
                    type="text"
                    value={formData.estado}
                    onChange={handleInputChange}
                    placeholder="Nome do estado"
                    className="dw-input"
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Tab: Dados Bancários */}
            <TabsContent value="dados-bancarios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    name="banco"
                    type="text"
                    value={formData.banco}
                    onChange={handleInputChange}
                    placeholder="Nome do banco"
                    className="dw-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    name="agencia"
                    type="text"
                    value={formData.agencia}
                    onChange={handleInputChange}
                    placeholder="0000"
                    className="dw-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    name="conta"
                    type="text"
                    value={formData.conta}
                    onChange={handleInputChange}
                    placeholder="00000-0"
                    className="dw-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chavePix">Chave PIX</Label>
                  <Input
                    id="chavePix"
                    name="chavePix"
                    type="text"
                    value={formData.chavePix}
                    onChange={handleInputChange}
                    placeholder="CPF, email ou telefone"
                    className="dw-input"
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Tab: Dados de Saúde */}
            <TabsContent value="dados-saude" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                  <Select value={formData.tipoSanguineo} onValueChange={(value) => handleSelectChange('tipoSanguineo', value)}>
                    <SelectTrigger className="!border !border-gray-600 dark:!border-gray-400 focus:!border-blue-500 dark:focus:!border-blue-400 !border-solid !shadow-none">
                      <SelectValue placeholder="Selecione o tipo sanguíneo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Plano de Saúde</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newPlanoSaude}
                        onChange={(e) => setNewPlanoSaude(e.target.value)}
                        placeholder="Digite o plano de saúde"
                        className="dw-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag('planoSaude', newPlanoSaude, setNewPlanoSaude);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addTag('planoSaude', newPlanoSaude, setNewPlanoSaude)}
                        className="shadow-none"
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.planoSaude.map((plano, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                        >
                          {plano}
                          <button
                            type="button"
                            onClick={() => removeTag('planoSaude', index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Alergias</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newAlergia}
                        onChange={(e) => setNewAlergia(e.target.value)}
                        placeholder="Digite uma alergia"
                        className="dw-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag('alergias', newAlergia, setNewAlergia);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addTag('alergias', newAlergia, setNewAlergia)}
                        className="shadow-none"
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.alergias.map((alergia, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md"
                        >
                          {alergia}
                          <button
                            type="button"
                            onClick={() => removeTag('alergias', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-3 pt-6">
            <Button type="submit" className="shadow-none">
              Cadastrar Diarista
            </Button>
            <Button type="button" variant="outline" className="dw-btn-outline" onClick={onBack}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroDiarista;
