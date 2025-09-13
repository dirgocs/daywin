import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar funções com integração ao banco de dados
 */
export const useFuncoes = () => {
  const [funcoes, setFuncoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalize = (f) => ({
    id: f?.id ?? f?.funcao_id ?? f?.funcaoId ?? f?.ID ?? f?.Id,
    funcao_nome: f?.funcao_nome ?? f?.nome ?? f?.name ?? '',
    pontos: Number(
      f?.pontos ?? f?.peso_pontos ?? f?.peso ?? f?.multiplicador ?? 1
    ),
    ativo: typeof f?.ativo === 'boolean' ? f.ativo : true,
    color: f?.color ?? 'default',
    ordem: typeof f?.ordem === 'number' ? f.ordem : 0,
  });

  /**
   * Carregar funções ativas do banco de dados
   */
  const loadFuncoes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se está no ambiente Electron
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.findAllActive();
        
        if (result.success) {
          const list = Array.isArray(result.data) ? result.data.map(normalize) : [];
          setFuncoes(list);
        } else {
          throw new Error(result.error || 'Erro ao carregar funções');
        }
      } else {
        // Fallback para dados mockados em ambiente de desenvolvimento
        console.warn('Electron API não disponível, usando dados mockados');
        setFuncoes([
          { id: 1, funcao_nome: "Limpeza Geral", pontos: 1.0, ativo: true, color: 'default' },
          { id: 2, funcao_nome: "Limpeza Pesada", pontos: 1.5, ativo: true, color: 'default' },
          { id: 3, funcao_nome: "Organização", pontos: 0.8, ativo: true, color: 'default' },
          { id: 4, funcao_nome: "Cozinha", pontos: 1.2, ativo: true, color: 'default' },
        ]);
      }
    } catch (err) {
      console.error('Erro ao carregar funções:', err);
      setError(err.message);
      
      // Em caso de erro, usar dados mockados como fallback
        setFuncoes([
          { id: 1, funcao_nome: "Limpeza Geral", pontos: 1.0, ativo: true, color: 'default' },
          { id: 2, funcao_nome: "Limpeza Pesada", pontos: 1.5, ativo: true, color: 'default' },
          { id: 3, funcao_nome: "Organização", pontos: 0.8, ativo: true, color: 'default' },
          { id: 4, funcao_nome: "Cozinha", pontos: 1.2, ativo: true, color: 'default' },
        ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Criar nova função
   */
  const createFuncao = async (funcaoData) => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.create(funcaoData);
        
        if (result.success) {
          await loadFuncoes();
          return normalize(result.data);
        } else {
          throw new Error(result.error || 'Erro ao criar função');
        }
      } else {
        // Simulação para desenvolvimento
        const newFuncao = {
          id: Date.now(),
          ...funcaoData,
          ativo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setFuncoes(prev => [...prev, newFuncao]);
        return normalize(newFuncao);
      }
    } catch (err) {
      console.error('Erro ao criar função:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Atualizar função existente
   */
  const updateFuncao = async (id, updateData) => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.update({ id, ...updateData });
        
        if (result.success) {
          await loadFuncoes();
          return normalize(result.data);
        } else {
          throw new Error(result.error || 'Erro ao atualizar função');
        }
      } else {
        // Simulação para desenvolvimento
        setFuncoes(prev => prev.map(f => 
          f.id === id ? { ...f, ...updateData, updatedAt: new Date() } : f
        ));
        return normalize({ id, ...updateData });
      }
    } catch (err) {
      console.error('Erro ao atualizar função:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Atualizar ordenação em lote
   */
  const updateOrder = async (pairs) => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.updateOrder(pairs);
        if (result.success) {
          await loadFuncoes();
          return result.data;
        } else {
          throw new Error(result.error || 'Erro ao atualizar ordenação');
        }
      } else {
        // Fallback local: aplica ordenação em memória
        const orderMap = new Map(pairs.map(p => [p.id, p.ordem]));
        setFuncoes(prev => prev
          .map(f => orderMap.has(f.id) ? { ...f, ordem: orderMap.get(f.id) } : f)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.funcao_nome.localeCompare(b.funcao_nome))
        );
        return { updated: pairs.length };
      }
    } catch (err) {
      console.error('Erro ao atualizar ordenação:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Desativar função (soft delete)
   */
  const deactivateFuncao = async (id) => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.deactivate(id);
        
        if (result.success) {
          await loadFuncoes(); // Recarregar lista
          return result.data;
        } else {
          throw new Error(result.error || 'Erro ao desativar função');
        }
      } else {
        // Simulação para desenvolvimento
        setFuncoes(prev => prev.map(f => 
          f.id === id ? { ...f, ativo: false, updatedAt: new Date() } : f
        ));
      }
    } catch (err) {
      console.error('Erro ao desativar função:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Reativar função
   */
  const activateFuncao = async (id) => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.activate(id);
        
        if (result.success) {
          await loadFuncoes(); // Recarregar lista
          return result.data;
        } else {
          throw new Error(result.error || 'Erro ao reativar função');
        }
      } else {
        // Simulação para desenvolvimento
        setFuncoes(prev => prev.map(f => 
          f.id === id ? { ...f, ativo: true, updatedAt: new Date() } : f
        ));
      }
    } catch (err) {
      console.error('Erro ao reativar função:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Buscar função por ID
   */
  const getFuncaoById = async (id) => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.findById(id);
        
        if (result.success) {
          return normalize(result.data);
        } else {
          throw new Error(result.error || 'Função não encontrada');
        }
      } else {
        // Fallback local
        return funcoes.find(f => f.id === id) || null;
      }
    } catch (err) {
      console.error('Erro ao buscar função:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Buscar funções por nome
   */
  const searchFuncoes = async (searchTerm) => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.searchByName(searchTerm);
        
        if (result.success) {
          return Array.isArray(result.data) ? result.data.map(normalize) : [];
        } else {
          throw new Error(result.error || 'Erro ao buscar funções');
        }
      } else {
        // Fallback local
        return funcoes.filter(f => 
          f.funcao_nome.toLowerCase().includes(searchTerm.toLowerCase()) && f.ativo
        );
      }
    } catch (err) {
      console.error('Erro ao buscar funções:', err);
      setError(err.message);
      return [];
    }
  };

  /**
   * Verificar se nome já existe
   */
  const checkNameExists = async (nome, excludeId = null) => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.nameExists(nome, excludeId);
        return result.success ? result.data : false;
      } else {
        // Fallback local
        return funcoes.some(f => 
          f.funcao_nome.toLowerCase() === nome.toLowerCase() && 
          (!excludeId || f.id !== excludeId)
        );
      }
    } catch (err) {
      console.error('Erro ao verificar nome:', err);
      return false;
    }
  };

  /**
   * Obter estatísticas das funções
   */
  const getFuncoesStats = async () => {
    try {
      setError(null);

      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.funcoes.getStats();
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Erro ao obter estatísticas');
        }
      } else {
        // Fallback local
        const ativas = funcoes.filter(f => f.ativo);
        const inativas = funcoes.filter(f => !f.ativo);
        const pontosMedio = ativas.length > 0 
          ? ativas.reduce((sum, f) => sum + f.pontos, 0) / ativas.length 
          : 0;

        return {
          total: funcoes.length,
          ativas: ativas.length,
          inativas: inativas.length,
          pontosMedio: Number(pontosMedio.toFixed(1)),
          maisUtilizada: ativas.length > 0 ? ativas[0].funcao_nome : null,
        };
      }
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      setError(err.message);
      return null;
    }
  };

  // Carregar funções ao montar o componente
  useEffect(() => {
    loadFuncoes();
  }, []);

  return {
    funcoes,
    loading,
    error,
    loadFuncoes,
    createFuncao,
    updateFuncao,
    updateOrder,
    deactivateFuncao,
    activateFuncao,
    getFuncaoById,
    searchFuncoes,
    checkNameExists,
    getFuncoesStats,
  };
};

export default useFuncoes;
