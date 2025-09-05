import { PrismaClient } from '@prisma/client';
import { databaseService } from '../services/database';

// Tipos temporários para resolver problemas de importação
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: Priority;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface TaskCreateInput {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date;
  userId: string;
}

interface TaskUpdateInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date;
}

/**
 * Repositório para gerenciamento de Tasks no Daywin
 * Implementa operações CRUD com Prisma + PGlite
 */
export class TaskRepository {
  private async getPrisma(): Promise<PrismaClient> {
    return databaseService.getClient();
  }

  /**
   * Cria uma nova task
   */
  async create(data: TaskCreateInput): Promise<Task> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.create({ 
        data: {
          ...data,
          id: data.id || this.generateId()
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to create task');
    }
  }

  /**
   * Busca todas as tasks de um usuário
   */
  async findMany(userId: string, options?: {
    completed?: boolean;
    priority?: Priority;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    try {
      const prisma = await this.getPrisma();
      
      const where: any = {
        userId,
        ...(options?.completed !== undefined && { completed: options.completed }),
        ...(options?.priority && { priority: options.priority }),
        ...(options?.search && {
          OR: [
            { title: { contains: options.search, mode: 'insensitive' } },
            { description: { contains: options.search, mode: 'insensitive' } }
          ]
        })
      };

      return await prisma.task.findMany({
        where,
        orderBy: [
          { completed: 'asc' }, // Não completadas primeiro
          { priority: 'desc' },  // Prioridade alta primeiro
          { createdAt: 'desc' }  // Mais recentes primeiro
        ],
        ...(options?.limit && { take: options.limit }),
        ...(options?.offset && { skip: options.offset })
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to fetch tasks');
    }
  }

  /**
   * Busca uma task por ID
   */
  async findById(id: string): Promise<Task | null> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.findUnique({ 
        where: { id }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to fetch task');
    }
  }

  /**
   * Busca tasks por IDs
   */
  async findByIds(ids: string[]): Promise<Task[]> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.findMany({
        where: {
          id: { in: ids }
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to fetch tasks by IDs');
    }
  }

  /**
   * Atualiza uma task
   */
  async update(id: string, data: TaskUpdateInput): Promise<Task> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.update({ 
        where: { id }, 
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to update task');
    }
  }

  /**
   * Deleta uma task
   */
  async delete(id: string): Promise<Task> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.delete({ 
        where: { id } 
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to delete task');
    }
  }

  /**
   * Deleta múltiplas tasks
   */
  async deleteMany(ids: string[]): Promise<{ count: number }> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.deleteMany({
        where: {
          id: { in: ids }
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to delete tasks');
    }
  }

  /**
   * Alterna o status de completada de uma task
   */
  async toggleComplete(id: string): Promise<Task> {
    try {
      const prisma = await this.getPrisma();
      
      // Buscar task atual
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        throw new Error('Task not found');
      }
      
      // Atualizar status
      return await prisma.task.update({
        where: { id },
        data: { 
          completed: !task.completed,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to toggle task completion');
    }
  }

  /**
   * Marca múltiplas tasks como completadas
   */
  async markManyAsCompleted(ids: string[]): Promise<{ count: number }> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.task.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          completed: true,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to mark tasks as completed');
    }
  }

  /**
   * Busca tasks com vencimento próximo
   */
  async findUpcoming(userId: string, days: number = 7): Promise<Task[]> {
    try {
      const prisma = await this.getPrisma();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return await prisma.task.findMany({
        where: {
          userId,
          completed: false,
          dueDate: {
            lte: futureDate,
            gte: new Date()
          }
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' }
        ]
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to fetch upcoming tasks');
    }
  }

  /**
   * Busca tasks atrasadas
   */
  async findOverdue(userId: string): Promise<Task[]> {
    try {
      const prisma = await this.getPrisma();
      const now = new Date();
      
      return await prisma.task.findMany({
        where: {
          userId,
          completed: false,
          dueDate: {
            lt: now
          }
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' }
        ]
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to fetch overdue tasks');
    }
  }

  /**
   * Conta tasks por status
   */
  async getTaskCounts(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    try {
      const prisma = await this.getPrisma();
      const now = new Date();
      
      const [total, completed, overdue] = await Promise.all([
        prisma.task.count({ where: { userId } }),
        prisma.task.count({ where: { userId, completed: true } }),
        prisma.task.count({ 
          where: { 
            userId, 
            completed: false, 
            dueDate: { lt: now } 
          } 
        })
      ]);
      
      return {
        total,
        completed,
        pending: total - completed,
        overdue
      };
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to get task counts');
    }
  }

  /**
   * Busca tasks por período
   */
  async findByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Task[]> {
    try {
      const prisma = await this.getPrisma();
      
      return await prisma.task.findMany({
        where: {
          userId,
          OR: [
            {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            {
              dueDate: {
                gte: startDate,
                lte: endDate
              }
            }
          ]
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      throw this.handlePrismaError(error, 'Failed to fetch tasks by date range');
    }
  }

  /**
   * Executa operação em transação
   */
  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    try {
      const prisma = await this.getPrisma();
      return await prisma.$transaction(fn);
    } catch (error) {
      throw this.handlePrismaError(error, 'Transaction failed');
    }
  }

  /**
   * Gera um ID único para a task
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Trata erros do Prisma
   */
  private handlePrismaError(error: unknown, defaultMessage: string): Error {
    if (error instanceof Error) {
      return new Error(`${defaultMessage}: ${error.message}`);
    }
    
    return new Error(defaultMessage);
  }
}

// Exportar instância singleton
export const taskRepository = new TaskRepository();