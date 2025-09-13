import { PrismaClient } from '@prisma/client';
import { databaseService } from '../services/database';

export interface CreateDiaristaData {
  nome_completo: string;
  apelido?: string | null;
  telefone?: string | null;
  email?: string | null;
  funcao_id?: number | null;
  pix_tipo?: string | null;
  pix_chave?: string | null;
  ativo?: boolean;
}

export interface UpdateDiaristaData extends Partial<CreateDiaristaData> {
  diarista_id: number;
}

export interface DiaristaWithFuncao {
  diarista_id: number;
  nome_completo: string;
  apelido: string | null;
  telefone: string | null;
  email: string | null;
  funcao_id: number | null;
  pix_tipo: string | null;
  pix_chave: string | null;
  ativo: boolean;
  funcao?: {
    funcao_id: number;
    funcao_nome: string;
    peso_pontos: number;
    ativo: boolean;
  } | null;
}

export class DiaristaRepository {
  private async getPrisma(): Promise<PrismaClient> {
    return databaseService.getClient();
  }

  /**
   * Criar uma nova diarista
   */
  async create(data: CreateDiaristaData): Promise<DiaristaWithFuncao> {
    try {
      const prisma = await this.getPrisma();
      const diarista = await prisma.diarista.create({
        data: {
          nome_completo: data.nome_completo,
          apelido: data.apelido,
          telefone: data.telefone,
          email: data.email,
          funcao_id: data.funcao_id,
          pix_tipo: data.pix_tipo,
          pix_chave: data.pix_chave,
          ativo: data.ativo ?? true,
        },
        include: {
          funcao: true,
        },
      });

      return diarista as DiaristaWithFuncao;
    } catch (error) {
      console.error('Erro ao criar diarista:', error);
      throw new Error('Falha ao cadastrar diarista');
    }
  }

  /**
   * Buscar diarista por ID
   */
  async findById(diarista_id: number): Promise<DiaristaWithFuncao | null> {
    try {
      const prisma = await this.getPrisma();
      const diarista = await prisma.diarista.findUnique({
        where: { diarista_id },
        include: {
          funcao: true,
        },
      });

      return diarista as DiaristaWithFuncao | null;
    } catch (error) {
      console.error('Erro ao buscar diarista por ID:', error);
      throw new Error('Falha ao buscar diarista');
    }
  }

  /**
   * Listar todas as diaristas ativas
   */
  async findAllActive(): Promise<DiaristaWithFuncao[]> {
    try {
      const prisma = await this.getPrisma();
      const diaristas = await prisma.diarista.findMany({
        where: { ativo: true },
        include: {
          funcao: true,
        },
        orderBy: {
          nome_completo: 'asc',
        },
      });

      return diaristas as DiaristaWithFuncao[];
    } catch (error) {
      console.error('Erro ao listar diaristas ativas:', error);
      throw new Error('Falha ao listar diaristas');
    }
  }

  /**
   * Listar todas as diaristas (ativas e inativas)
   */
  async findAll(): Promise<DiaristaWithFuncao[]> {
    try {
      const prisma = await this.getPrisma();
      const diaristas = await prisma.diarista.findMany({
        include: {
          funcao: true,
        },
        orderBy: {
          nome_completo: 'asc',
        },
      });

      return diaristas as DiaristaWithFuncao[];
    } catch (error) {
      console.error('Erro ao listar todas as diaristas:', error);
      throw new Error('Falha ao listar diaristas');
    }
  }

  /**
   * Atualizar diarista
   */
  async update(data: UpdateDiaristaData): Promise<DiaristaWithFuncao> {
    try {
      const prisma = await this.getPrisma();
      const { diarista_id, ...updateData } = data;
      
      const diarista = await prisma.diarista.update({
        where: { diarista_id },
        data: updateData,
        include: {
          funcao: true,
        },
      });

      return diarista as DiaristaWithFuncao;
    } catch (error) {
      console.error('Erro ao atualizar diarista:', error);
      throw new Error('Falha ao atualizar diarista');
    }
  }

  /**
   * Desativar diarista (soft delete)
   */
  async deactivate(diarista_id: number): Promise<DiaristaWithFuncao> {
    try {
      const prisma = await this.getPrisma();
      const diarista = await prisma.diarista.update({
        where: { diarista_id },
        data: { ativo: false },
        include: {
          funcao: true,
        },
      });

      return diarista as DiaristaWithFuncao;
    } catch (error) {
      console.error('Erro ao desativar diarista:', error);
      throw new Error('Falha ao desativar diarista');
    }
  }

  /**
   * Reativar diarista
   */
  async activate(diarista_id: number): Promise<DiaristaWithFuncao> {
    try {
      const prisma = await this.getPrisma();
      const diarista = await prisma.diarista.update({
        where: { diarista_id },
        data: { ativo: true },
        include: {
          funcao: true,
        },
      });

      return diarista as DiaristaWithFuncao;
    } catch (error) {
      console.error('Erro ao reativar diarista:', error);
      throw new Error('Falha ao reativar diarista');
    }
  }

  /**
   * Buscar diaristas por nome (busca parcial)
   */
  async searchByName(searchTerm: string): Promise<DiaristaWithFuncao[]> {
    try {
      const prisma = await this.getPrisma();
      const diaristas = await prisma.diarista.findMany({
        where: {
          OR: [
            {
              nome_completo: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              apelido: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
          ativo: true,
        },
        include: {
          funcao: true,
        },
        orderBy: {
          nome_completo: 'asc',
        },
      });

      return diaristas as DiaristaWithFuncao[];
    } catch (error) {
      console.error('Erro ao buscar diaristas por nome:', error);
      throw new Error('Falha ao buscar diaristas');
    }
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const prisma = await this.getPrisma();
      const where: any = { email };
      
      if (excludeId) {
        where.NOT = { diarista_id: excludeId };
      }

      const count = await prisma.diarista.count({ where });
      return count > 0;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  /**
   * Buscar diaristas por função
   */
  async findByFuncao(funcao_id: number): Promise<DiaristaWithFuncao[]> {
    try {
      const prisma = await this.getPrisma();
      const diaristas = await prisma.diarista.findMany({
        where: {
          funcao_id,
          ativo: true,
        },
        include: {
          funcao: true,
        },
        orderBy: {
          nome_completo: 'asc',
        },
      });

      return diaristas as DiaristaWithFuncao[];
    } catch (error) {
      console.error('Erro ao buscar diaristas por função:', error);
      throw new Error('Falha ao buscar diaristas por função');
    }
  }

}

export default DiaristaRepository;