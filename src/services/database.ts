import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

/**
 * Serviço de banco de dados para o Daywin
 * Integra PGlite com Prisma ORM para persistência local 100% offline
 */
class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Inicializa o banco de dados com Prisma
   */
  async initialize(): Promise<PrismaClient> {
    if (this.isInitialized && this.prisma) {
      return this.prisma;
    }

    try {
      console.log('🔄 Initializing Daywin database...');
      
      // Inicializar Prisma Client
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
      });

      // Executar setup inicial do schema
      await this.setupSchema();

      this.isInitialized = true;
      console.log('✅ Daywin database initialized successfully');
      
      return this.prisma;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      await this.cleanup();
      throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configura o schema inicial do banco
   */
  private async setupSchema(): Promise<void> {
    if (!this.prisma) throw new Error('Prisma not initialized');
    
    try {
      console.log('🔧 Setting up database schema...');
      
      // Criar tabela de controle de migrações se não existir
      await this.prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "_daywin_migrations" (
          "id" VARCHAR(36) PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "applied_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "checksum" VARCHAR(64) NOT NULL
        );
      `;

      // Executar migrações básicas do schema
      await this.runBasicMigrations();
      
      console.log('✅ Database schema setup completed');
    } catch (error) {
      console.error('❌ Schema setup failed:', error);
      throw error;
    }
  }

  /**
   * Executa migrações básicas do schema
   */
  private async runBasicMigrations(): Promise<void> {
    if (!this.prisma) return;

    try {
      // Verificar se as tabelas principais existem
      const tables = await this.prisma.$queryRaw<Array<{table_name: string}>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('User', 'Task', 'Habit', 'HabitEntry');
      `;

      const existingTables = tables.map((t: { table_name: string }) => t.table_name);
      console.log('📋 Existing tables:', existingTables);

      // Se não há tabelas principais, criar schema básico
      if (existingTables.length === 0) {
        await this.createInitialSchema();
      }
    } catch (error) {
      console.error('Migration check failed:', error);
      // Em caso de erro, tentar criar schema básico
      await this.createInitialSchema();
    }
  }

  /**
   * Cria o schema inicial das tabelas principais
   */
  private async createInitialSchema(): Promise<void> {
    if (!this.prisma) return;

    console.log('🏗️ Creating initial schema...');

    // Criar enum Priority
    await this.prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Criar tabela User
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "name" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    // Criar tabela Task
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Task" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
        "dueDate" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" TEXT NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `;

    // Criar tabela Habit
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Habit" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "frequency" TEXT NOT NULL,
        "target" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" TEXT NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `;

    // Criar tabela HabitEntry
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "HabitEntry" (
        "id" TEXT PRIMARY KEY,
        "date" TIMESTAMPTZ NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "value" INTEGER NOT NULL DEFAULT 1,
        "habitId" TEXT NOT NULL,
        FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE,
        UNIQUE("habitId", "date")
      );
    `;

    // Criar índices para performance
    await this.prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");`;
    await this.prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Task_completed_idx" ON "Task"("completed");`;
    await this.prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Habit_userId_idx" ON "Habit"("userId");`;
    await this.prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "HabitEntry_habitId_idx" ON "HabitEntry"("habitId");`;
    await this.prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "HabitEntry_date_idx" ON "HabitEntry"("date");`;

    console.log('✅ Initial schema created successfully');
  }

  /**
   * Retorna o cliente Prisma inicializado
   */
  async getClient(): Promise<PrismaClient> {
    if (!this.isInitialized || !this.prisma) {
      return await this.initialize();
    }
    return this.prisma;
  }

  /**
   * Verifica se o banco está conectado e funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.prisma) return false;
      
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Executa backup dos dados
   */
  async createBackup(): Promise<string> {
    try {
      if (!this.prisma) throw new Error('Database not initialized');
      
      console.log('📦 Creating database backup...');
      
      const backup: any = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          users: await this.prisma.user.findMany(),
          diaristas: await this.prisma.diarista.findMany(),
          funcoes: await this.prisma.funcao.findMany(),
          diasTrabalhados: await this.prisma.diaTrabalhado.findMany()
        }
      };
      
      const backupJson = JSON.stringify(backup, null, 2);
      
      // Salvar backup no userData
      const backupPath = path.join(
        app.getPath('userData'), 
        'backups', 
        `daywin-backup-${new Date().toISOString().split('T')[0]}.json`
      );
      
      await this.ensureDirectoryExists(path.dirname(backupPath));
      await fs.writeFile(backupPath, backupJson, 'utf8');
      
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Desconecta e limpa recursos
   */
  async disconnect(): Promise<void> {
    try {
      console.log('🔌 Disconnecting from database...');
      
      if (this.prisma) {
        await this.prisma.$disconnect();
        this.prisma = null;
      }
      

      
      this.isInitialized = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Error during database disconnect:', error);
    }
  }

  /**
   * Limpa recursos em caso de erro
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
        this.prisma = null;
      }

      this.isInitialized = false;
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Garante que um diretório existe
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Retorna estatísticas do banco
   */
  async getStats(): Promise<{
    users: number;
    diaristas: number;
    funcoes: number;
    diasTrabalhados: number;
    dbSize: string;
  }> {
    if (!this.prisma) throw new Error('Database not initialized');
    
    const [users, diaristas, funcoes, diasTrabalhados] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.diarista.count(),
      this.prisma.funcao.count(),
      this.prisma.diaTrabalhado.count()
    ]);
    
    // Calcular tamanho aproximado do banco
    const dbPath = path.join(app.getPath('userData'), 'daywin.pglite');
    let dbSize = '0 MB';
    
    try {
      const stats = await fs.stat(dbPath);
      dbSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
    } catch {
      // Ignore if can't get size
    }
    
    return {
      users,
      diaristas,
      funcoes,
      diasTrabalhados,
      dbSize
    };
  }
}

// Exportar instância singleton
export const databaseService = DatabaseService.getInstance();
export type { PrismaClient };