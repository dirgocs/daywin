# Guia de Integração PGlite + Prisma para Daywin

## Visão Geral

Este documento detalha como integrar PGlite com Prisma ORM no projeto Daywin, uma aplicação Electron local-first. <mcreference link="https://pglite.dev/docs/orm-support" index="2">2</mcreference> <mcreference link="https://www.npmjs.com/package/pglite-prisma-adapter" index="5">5</mcreference>

## Vantagens da Integração

### PGlite Benefits
- **100% Offline**: Banco PostgreSQL completo rodando no browser/Node.js <mcreference link="https://pglite.dev/docs/orm-support" index="2">2</mcreference>
- **Zero Configuração**: Não requer instalação de servidor PostgreSQL
- **Compatibilidade Total**: SQL PostgreSQL completo com extensões
- **Performance**: Execução in-process sem overhead de rede
- **Portabilidade**: Dados armazenados em arquivos locais

### Prisma Integration
- **Type Safety**: ORM totalmente tipado para TypeScript <mcreference link="https://www.npmjs.com/package/pglite-prisma-adapter" index="5">5</mcreference>
- **Migrations**: Suporte completo a migrações de schema
- **Query Builder**: API declarativa e intuitiva
- **Driver Adapters**: Suporte nativo via preview features <mcreference link="https://www.prisma.io/blog/prisma-6-9-0-release" index="4">4</mcreference>

## Configuração do Projeto

### 1. Dependências Necessárias

```bash
npm install @electric-sql/pglite pglite-prisma-adapter
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Schema Prisma Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgres"
  // URL obrigatória mas será ignorada com adapter
  url      = "postgresql://localhost:5432/daywin"
}

// Modelos do Daywin
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  tasks     Task[]
  habits    Habit[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Habit {
  id          String   @id @default(cuid())
  name        String
  description String?
  frequency   String   // daily, weekly, monthly
  target      Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries     HabitEntry[]
}

model HabitEntry {
  id        String   @id @default(cuid())
  date      DateTime
  completed Boolean  @default(false)
  value     Int      @default(1)
  
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@unique([habitId, date])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### 3. Database Service Implementation

```typescript
// src/services/database.ts
import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import path from 'path';

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient | null = null;
  private pglite: PGlite | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<PrismaClient> {
    if (this.prisma) {
      return this.prisma;
    }

    try {
      // Caminho para o banco de dados no userData do Electron
      const dbPath = path.join(app.getPath('userData'), 'daywin.pglite');
      
      // Inicializar PGlite
      this.pglite = new PGlite({
        dataDir: dbPath,
        // Extensões opcionais
        extensions: {
          // uuid: true, // Para suporte a UUID
          // vector: true, // Para pgvector se necessário
        }
      });

      // Criar adapter Prisma
      const adapter = new PrismaPGlite(this.pglite);

      // Inicializar Prisma Client
      this.prisma = new PrismaClient({ adapter });

      // Executar migrações/push do schema
      await this.runMigrations();

      console.log('✅ Database initialized successfully');
      return this.prisma;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.prisma) throw new Error('Prisma not initialized');
    
    try {
      // Para desenvolvimento, usar db push
      // Em produção, considerar sistema de migrações customizado
      await this.prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
          "id" VARCHAR(36) PRIMARY KEY,
          "checksum" VARCHAR(64) NOT NULL,
          "finished_at" TIMESTAMPTZ,
          "migration_name" VARCHAR(255) NOT NULL,
          "logs" TEXT,
          "rolled_back_at" TIMESTAMPTZ,
          "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "applied_steps_count" INTEGER NOT NULL DEFAULT 0
        );
      `;
      
      console.log('✅ Database schema ready');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async getClient(): Promise<PrismaClient> {
    if (!this.prisma) {
      await this.initialize();
    }
    return this.prisma!;
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
    if (this.pglite) {
      await this.pglite.close();
      this.pglite = null;
    }
  }

  // Método para backup/export
  async exportData(): Promise<string> {
    if (!this.pglite) throw new Error('PGlite not initialized');
    
    // Implementar export personalizado se necessário
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      // dados exportados
    });
  }
}

export const databaseService = DatabaseService.getInstance();
export type { PrismaClient };
```

### 4. Repository Pattern Implementation

```typescript
// src/repositories/TaskRepository.ts
import { PrismaClient, Task, Prisma } from '@prisma/client';
import { databaseService } from '../services/database';

export class TaskRepository {
  private async getPrisma(): Promise<PrismaClient> {
    return databaseService.getClient();
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    const prisma = await this.getPrisma();
    return prisma.task.create({ data });
  }

  async findMany(userId: string): Promise<Task[]> {
    const prisma = await this.getPrisma();
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Task | null> {
    const prisma = await this.getPrisma();
    return prisma.task.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    const prisma = await this.getPrisma();
    return prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Task> {
    const prisma = await this.getPrisma();
    return prisma.task.delete({ where: { id } });
  }

  async toggleComplete(id: string): Promise<Task> {
    const prisma = await this.getPrisma();
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');
    
    return prisma.task.update({
      where: { id },
      data: { completed: !task.completed }
    });
  }
}
```

## Configuração do Electron Main Process

```typescript
// src/main/main.ts
import { app, BrowserWindow } from 'electron';
import { databaseService } from '../services/database';

app.whenReady().then(async () => {
  try {
    // Inicializar banco antes de criar janelas
    await databaseService.initialize();
    
    // Criar janela principal
    createMainWindow();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Fechar conexões do banco
  await databaseService.disconnect();
});
```

## Desenvolvimento e Migrações

### Usando Prisma Dev (Recomendado)

<mcreference link="https://www.prisma.io/docs/postgres/database/local-development" index="1">1</mcreference> <mcreference link="https://pglite.dev/docs/orm-support" index="2">2</mcreference>

```bash
# Inicializar Prisma com PGlite local
npx prisma init
npx prisma dev

# Copiar connection string e usar no .env
# DATABASE_URL="prisma+postgres://localhost:PORT/?api_key=__API_KEY__"

# Aplicar mudanças no schema
npx prisma db push

# Gerar cliente
npx prisma generate
```

### Usando prisma-pglite CLI

<mcreference link="https://electrovir.github.io/prisma-pglite/index.html" index="3">3</mcreference>

```bash
# Instalar CLI helper
npm install -D prisma-pglite

# Criar migrações
npx prisma-pglite migrate dev --name "initial_schema"

# Reset do banco
npx prisma-pglite migrate reset
```

## Melhores Práticas

### 1. Error Handling
```typescript
try {
  const result = await taskRepository.create(taskData);
  return result;
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        throw new Error('Unique constraint violation');
      case 'P2025':
        throw new Error('Record not found');
      default:
        throw new Error(`Database error: ${error.message}`);
    }
  }
  throw error;
}
```

### 2. Connection Management
- Usar singleton pattern para DatabaseService
- Inicializar conexão no app startup
- Fechar conexões no app shutdown
- Implementar reconnection logic se necessário

### 3. Performance
- Usar índices apropriados no schema
- Implementar paginação para listas grandes
- Considerar connection pooling para múltiplas operações
- Usar transações para operações relacionadas

### 4. Backup e Sync
```typescript
// Implementar backup periódico
setInterval(async () => {
  try {
    const backup = await databaseService.exportData();
    // Salvar backup em local seguro
  } catch (error) {
    console.error('Backup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Daily backup
```

## Troubleshooting

### Problemas Comuns

1. **Preview Features**: Certifique-se de habilitar `driverAdapters` no schema.prisma
2. **Path Issues**: Use caminhos absolutos para o diretório do banco
3. **Migration Errors**: Para desenvolvimento, prefira `db push` ao invés de `migrate dev`
4. **Performance**: PGlite pode ser mais lento que PostgreSQL nativo para operações muito grandes

### Debug
```typescript
// Habilitar logs do Prisma
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});
```

## Conclusão

A integração PGlite + Prisma oferece uma solução robusta para aplicações Electron local-first, combinando:

- **Simplicidade**: Zero configuração de servidor
- **Compatibilidade**: PostgreSQL completo
- **Type Safety**: Prisma ORM totalmente tipado
- **Performance**: Execução in-process
- **Portabilidade**: Dados em arquivos locais

Esta configuração atende perfeitamente aos requisitos do projeto Daywin para uma aplicação 100% offline com persistência local confiável.