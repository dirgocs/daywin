import { PrismaClient } from '@prisma/client';
import { databaseService } from '../services/database';

export interface CreateFuncaoData {
  funcao_nome: string;
  pontos?: number; // será salvo em peso_pontos
  ativo?: boolean;
  color?: string;
}

export interface UpdateFuncaoData extends Partial<CreateFuncaoData> {
  id: number; // funcao_id
}

export interface FuncaoData {
  id: number;
  funcao_nome: string;
  pontos: number;
  ativo: boolean;
  color?: string | null;
  ordem?: number;
}

function mapFuncaoRow(row: any): FuncaoData {
  return {
    id: row.funcao_id ?? row.id,
    funcao_nome: row.funcao_nome,
    pontos: Number(row.peso_pontos ?? row.pontos ?? 1),
    ativo: row.ativo,
    color: row.color ?? null,
    ordem: typeof row.ordem === 'number' ? row.ordem : 0,
  };
}

export class FuncaoRepository {
  private async getPrisma(): Promise<PrismaClient> {
    return databaseService.getClient();
  }

  /**
   * Criar uma nova função
   */
  async create(data: CreateFuncaoData): Promise<FuncaoData> {
    try {
      const prisma = await this.getPrisma();
      const funcao = await prisma.funcao.create({
        data: {
          funcao_nome: data.funcao_nome,
          peso_pontos: data.pontos ?? 1.0,
          ativo: data.ativo ?? true,
          color: data.color ?? 'default',
        },
      });
      return mapFuncaoRow(funcao);
    } catch (error) {
      console.error('Erro ao criar função:', error);
      throw new Error('Falha ao cadastrar função');
    }
  }

  /**
   * Buscar função por ID
   */
  async findById(id: number): Promise<FuncaoData | null> {
    try {
      const prisma = await this.getPrisma();
      const funcao = await prisma.funcao.findUnique({ where: { funcao_id: id } });
      return funcao ? mapFuncaoRow(funcao) : null;
    } catch (error) {
      console.error('Erro ao buscar função por ID:', error);
      throw new Error('Falha ao buscar função');
    }
  }

  /**
   * Listar todas as funções ativas
   */
  async findAllActive(): Promise<FuncaoData[]> {
    try {
      const prisma = await this.getPrisma();
      const funcoes = await prisma.funcao.findMany({
        where: { ativo: true },
        orderBy: [
          { ordem: 'asc' },
          { funcao_nome: 'asc' },
        ],
      });
      return funcoes.map(mapFuncaoRow);
    } catch (error) {
      console.error('Erro ao listar funções ativas:', error);
      throw new Error('Falha ao listar funções');
    }
  }

  /**
   * Listar todas as funções (ativas e inativas)
   */
  async findAll(): Promise<FuncaoData[]> {
    try {
      const prisma = await this.getPrisma();
      const funcoes = await prisma.funcao.findMany({
        orderBy: [
          { ordem: 'asc' },
          { funcao_nome: 'asc' },
        ],
      });
      return funcoes.map(mapFuncaoRow);
    } catch (error) {
      console.error('Erro ao listar todas as funções:', error);
      throw new Error('Falha ao listar funções');
    }
  }

  /**
   * Atualizar função
   */
  async update(data: UpdateFuncaoData): Promise<FuncaoData> {
    try {
      const prisma = await this.getPrisma();
      const { id, ...rest } = data as any;
      const updateData: any = {};
      if (typeof rest.funcao_nome !== 'undefined') updateData.funcao_nome = rest.funcao_nome;
      if (typeof rest.pontos !== 'undefined') updateData.peso_pontos = rest.pontos;
      if (typeof rest.ativo !== 'undefined') updateData.ativo = rest.ativo;
      if (typeof rest.color !== 'undefined') updateData.color = rest.color;
      if (typeof (rest as any).ordem !== 'undefined') (updateData as any).ordem = (rest as any).ordem;
      const funcao = await prisma.funcao.update({
        where: { funcao_id: id },
        data: updateData,
      });
      return mapFuncaoRow(funcao);
    } catch (error) {
      console.error('Erro ao atualizar função:', error);
      throw new Error('Falha ao atualizar função');
    }
  }

  /**
   * Atualizar ordenação em lote
   */
  async updateOrder(pairs: { id: number; ordem: number }[]): Promise<{ updated: number }> {
    try {
      const prisma = await this.getPrisma();
      const tx = pairs.map((p) =>
        prisma.funcao.update({ where: { funcao_id: p.id }, data: { ordem: p.ordem } })
      );
      const res = await prisma.$transaction(tx);
      return { updated: res.length };
    } catch (error) {
      console.error('Erro ao atualizar ordenação das funções:', error);
      throw new Error('Falha ao atualizar ordenação');
    }
  }

  /**
   * Desativar função (soft delete)
   */
  async deactivate(id: number): Promise<FuncaoData> {
    try {
      const prisma = await this.getPrisma();
      const funcao = await prisma.funcao.update({
        where: { funcao_id: id },
        data: { ativo: false },
      });
      return mapFuncaoRow(funcao);
    } catch (error) {
      console.error('Erro ao desativar função:', error);
      throw new Error('Falha ao desativar função');
    }
  }

  /**
   * Reativar função
   */
  async activate(id: number): Promise<FuncaoData> {
    try {
      const prisma = await this.getPrisma();
      const funcao = await prisma.funcao.update({
        where: { funcao_id: id },
        data: { ativo: true },
      });
      return mapFuncaoRow(funcao);
    } catch (error) {
      console.error('Erro ao reativar função:', error);
      throw new Error('Falha ao reativar função');
    }
  }

  /**
   * Buscar funções por nome (busca parcial)
   */
  async searchByName(searchTerm: string): Promise<FuncaoData[]> {
    try {
      const prisma = await this.getPrisma();
      const funcoes = await prisma.funcao.findMany({
        where: {
          funcao_nome: {
            contains: searchTerm,
            mode: 'insensitive',
          },
          ativo: true,
        },
        orderBy: {
          funcao_nome: 'asc',
        },
      });
      return funcoes.map(mapFuncaoRow);
    } catch (error) {
      console.error('Erro ao buscar funções por nome:', error);
      throw new Error('Falha ao buscar funções');
    }
  }

  /**
   * Verificar se nome já existe
   */
  async nameExists(nome: string, excludeId?: number): Promise<boolean> {
    try {
      const prisma = await this.getPrisma();
      const where: any = { funcao_nome: nome };
      
      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const count = await prisma.funcao.count({ where });
      return count > 0;
    } catch (error) {
      console.error('Erro ao verificar nome da função:', error);
      return false;
    }
  }

  /**
   * Buscar funções por faixa de pontos
   */
  async findByPointsRange(minPontos: number, maxPontos: number): Promise<FuncaoData[]> {
    try {
      const prisma = await this.getPrisma();
      const funcoes = await prisma.funcao.findMany({
        where: {
          pontos: {
            gte: minPontos,
            lte: maxPontos,
          },
          ativo: true,
        },
        orderBy: {
          pontos: 'desc',
        },
      });

      return funcoes as FuncaoData[];
    } catch (error) {
      console.error('Erro ao buscar funções por faixa de pontos:', error);
      throw new Error('Falha ao buscar funções por pontos');
    }
  }

  /**
   * Contar funções ativas
   */
  async countActive(): Promise<number> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.funcao.count({
        where: { ativo: true },
      });
    } catch (error) {
      console.error('Erro ao contar funções ativas:', error);
      throw new Error('Falha ao contar funções');
    }
  }

  /**
   * Buscar funções mais utilizadas
   */
  async findMostUsed(limit: number = 10): Promise<(FuncaoData & { _count: { diasTrabalhados: number } })[]> {
    try {
      const prisma = await this.getPrisma();
      const funcoes = await prisma.funcao.findMany({
        where: { ativo: true },
        include: {
          _count: {
            select: { diasTrabalhados: true },
          },
        },
        orderBy: {
          diasTrabalhados: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      return funcoes as (FuncaoData & { _count: { diasTrabalhados: number } })[];
    } catch (error) {
      console.error('Erro ao buscar funções mais utilizadas:', error);
      throw new Error('Falha ao buscar funções populares');
    }
  }

  /**
   * Obter estatísticas das funções
   */
  async getStats(): Promise<{
    total: number;
    ativas: number;
    inativas: number;
    pontosMedio: number;
    maisUtilizada: string | null;
  }> {
    try {
      const prisma = await this.getPrisma();
      
      const [
        total,
        ativas, 
        funcoes,
        maisUtilizadas
      ] = await Promise.all([
        prisma.funcao.count(),
        prisma.funcao.count({ where: { ativo: true } }),
        prisma.funcao.findMany({ where: { ativo: true }, select: { pontos: true } }),
        this.findMostUsed(1)
      ]);

      const inativas = total - ativas;
      const pontosMedio = funcoes.length > 0 
        ? funcoes.reduce((sum, f) => sum + Number(f.pontos), 0) / funcoes.length 
        : 0;
      const maisUtilizada = maisUtilizadas.length > 0 ? maisUtilizadas[0].funcao_nome : null;

      return {
        total,
        ativas,
        inativas,
        pontosMedio: Number(pontosMedio.toFixed(1)),
        maisUtilizada,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas das funções:', error);
      throw new Error('Falha ao calcular estatísticas');
    }
  }
}

export default FuncaoRepository;
