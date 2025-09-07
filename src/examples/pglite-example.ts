/**
 * Exemplo de integração PGlite + Prisma para o projeto Daywin
 * Este arquivo demonstra como usar o PGlite com Prisma de forma prática
 */

import { PGlite } from '@electric-sql/pglite';
import { PrismaClient } from '@prisma/client';

/**
 * Exemplo de configuração e uso do PGlite com Prisma
 */
export class PGliteExample {
  private pglite: PGlite;
  private prisma: PrismaClient;

  constructor() {
    // Inicializa PGlite em memória para exemplo
    this.pglite = new PGlite();
    
    // Configura Prisma para usar PGlite
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://user:password@localhost:5432/daywin'
        }
      }
    });
  }

  /**
   * Inicializa o banco de dados com o schema
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando PGlite...');
      
      // Executa o schema SQL diretamente no PGlite
      await this.createSchema();
      
      console.log('✅ PGlite inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar PGlite:', error);
      throw error;
    }
  }

  /**
   * Cria o schema do banco de dados
   */
  private async createSchema(): Promise<void> {
    const schema = `
      -- Enum para prioridades
      CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      
      -- Tabela de usuários
      CREATE TABLE "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
      
      -- Tabela de tasks
      CREATE TABLE "tasks" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
        "dueDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
      );
      
      -- Índices
      CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
      CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");
      CREATE INDEX "tasks_completed_idx" ON "tasks"("completed");
      CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");
      CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");
      
      -- Foreign keys
      ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    
    await this.pglite.exec(schema);
  }

  /**
   * Exemplo de inserção de dados
   */
  async seedData(): Promise<void> {
    try {
      console.log('🌱 Inserindo dados de exemplo...');
      
      // Insere usuário de exemplo
      await this.pglite.exec(`
        INSERT INTO users (id, email, name, "updatedAt") 
        VALUES ('user1', 'usuario@daywin.com', 'Usuário Teste', CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO NOTHING;
      `);
      
      // Insere tasks de exemplo
      await this.pglite.exec(`
        INSERT INTO tasks (id, title, description, priority, "userId", "updatedAt") 
        VALUES 
          ('task1', 'Configurar PGlite', 'Integrar PGlite com Prisma no Daywin', 'HIGH', 'user1', CURRENT_TIMESTAMP),
          ('task2', 'Criar interface', 'Desenvolver interface para gerenciar tasks', 'MEDIUM', 'user1', CURRENT_TIMESTAMP),
          ('task3', 'Testes unitários', 'Escrever testes para o repositório', 'LOW', 'user1', CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
      `);
      
      console.log('✅ Dados inseridos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inserir dados:', error);
      throw error;
    }
  }

  /**
   * Exemplo de consulta de dados
   */
  async queryData(): Promise<void> {
    try {
      console.log('🔍 Consultando dados...');
      
      // Busca todas as tasks
      const tasks = await this.pglite.query(`
        SELECT t.*, u.name as userName 
        FROM tasks t 
        JOIN users u ON t."userId" = u.id 
        ORDER BY t."createdAt" DESC
      `);
      
      console.log('📋 Tasks encontradas:');
      tasks.rows.forEach((task: any) => {
        console.log(`  - ${task.title} (${task.priority}) - ${task.userName}`);
      });
      
      // Estatísticas
      const stats = await this.pglite.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed,
          COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as high_priority
        FROM tasks
      `);
      
      console.log('📊 Estatísticas:', stats.rows[0]);
      
    } catch (error) {
      console.error('❌ Erro ao consultar dados:', error);
      throw error;
    }
  }

  /**
   * Exemplo de backup dos dados
   */
  async backup(): Promise<File | Blob> {
    try {
      console.log('💾 Criando backup...');
      
      const backup = await this.pglite.dumpDataDir();
      console.log('✅ Backup criado com sucesso!');
      
      return backup;
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  /**
   * Limpa recursos
   */
  async cleanup(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      await this.pglite.close();
      console.log('🧹 Recursos limpos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao limpar recursos:', error);
    }
  }
}

/**
 * Função principal para executar o exemplo
 */
export async function runPGliteExample(): Promise<void> {
  const example = new PGliteExample();
  
  try {
    await example.initialize();
    await example.seedData();
    await example.queryData();
    
    const backup = await example.backup();
    console.log(`📦 Backup size: ${backup.size} bytes`);
    
  } catch (error) {
    console.error('💥 Erro no exemplo:', error);
  } finally {
    await example.cleanup();
  }
}

// Executa o exemplo se chamado diretamente
if (require.main === module) {
  runPGliteExample().catch(console.error);
}