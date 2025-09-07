-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."funcoes" (
    "funcao_id" SERIAL NOT NULL,
    "funcao_nome" TEXT NOT NULL,
    "peso_pontos" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "funcoes_pkey" PRIMARY KEY ("funcao_id")
);

-- CreateTable
CREATE TABLE "public"."diaristas" (
    "diarista_id" SERIAL NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "apelido" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "funcao_id" INTEGER,
    "pix_tipo" TEXT,
    "pix_chave" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "diaristas_pkey" PRIMARY KEY ("diarista_id")
);

-- CreateTable
CREATE TABLE "public"."dias_trabalhados" (
    "lanc_id" BIGSERIAL NOT NULL,
    "data" DATE NOT NULL,
    "diarista_id" INTEGER NOT NULL,
    "funcao_id" INTEGER,
    "horas_trabalhadas" DECIMAL(6,2) NOT NULL DEFAULT 8.00,
    "diaria_valor" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "observacoes" TEXT,

    CONSTRAINT "dias_trabalhados_pkey" PRIMARY KEY ("lanc_id")
);

-- CreateTable
CREATE TABLE "public"."taxa_servico" (
    "taxa_id" BIGSERIAL NOT NULL,
    "data" DATE NOT NULL,
    "referencia" TEXT,
    "valor_arrecadado" DECIMAL(12,2) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "taxa_servico_pkey" PRIMARY KEY ("taxa_id")
);

-- CreateTable
CREATE TABLE "public"."bonificacoes" (
    "bonus_id" BIGSERIAL NOT NULL,
    "data" DATE NOT NULL,
    "diarista_id" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "bonificacoes_pkey" PRIMARY KEY ("bonus_id")
);

-- CreateTable
CREATE TABLE "public"."descontos" (
    "desc_id" BIGSERIAL NOT NULL,
    "data" DATE NOT NULL,
    "diarista_id" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "descontos_pkey" PRIMARY KEY ("desc_id")
);

-- CreateTable
CREATE TABLE "public"."regras_taxa_servico" (
    "regra_id" SERIAL NOT NULL,
    "modo" TEXT NOT NULL DEFAULT 'pontos_funcao',
    "percentual_para_diaristas" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "min_horas_para_eligibilidade" DECIMAL(6,2) NOT NULL DEFAULT 4.00,
    "arredondamento_cinquentavos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "regras_taxa_servico_pkey" PRIMARY KEY ("regra_id")
);

-- CreateTable
CREATE TABLE "public"."periodos" (
    "periodo_id" SERIAL NOT NULL,
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "fechado_em" TIMESTAMP(3),
    "fechado_por" TEXT,
    "observacoes" TEXT,
    "freq_tipo" TEXT NOT NULL,
    "freq_ancora" JSONB,
    "freq_opcao" TEXT,

    CONSTRAINT "periodos_pkey" PRIMARY KEY ("periodo_id")
);

-- CreateTable
CREATE TABLE "public"."fechamentos" (
    "fechamento_id" BIGSERIAL NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "diarista_id" INTEGER NOT NULL,
    "horas_total" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "pontos" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "diarias_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bonus_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descontos_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cota_taxa" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_pagar" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "fechamentos_pkey" PRIMARY KEY ("fechamento_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "login" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "perm_key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("perm_key")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "role_id" INTEGER NOT NULL,
    "perm_key" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","perm_key")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "public"."auditoria" (
    "audit_id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT,
    "detalhes" JSONB,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "dias_trabalhados_data_idx" ON "public"."dias_trabalhados"("data");

-- CreateIndex
CREATE INDEX "dias_trabalhados_diarista_id_idx" ON "public"."dias_trabalhados"("diarista_id");

-- CreateIndex
CREATE INDEX "taxa_servico_data_idx" ON "public"."taxa_servico"("data");

-- CreateIndex
CREATE INDEX "bonificacoes_data_idx" ON "public"."bonificacoes"("data");

-- CreateIndex
CREATE INDEX "bonificacoes_diarista_id_idx" ON "public"."bonificacoes"("diarista_id");

-- CreateIndex
CREATE INDEX "descontos_data_idx" ON "public"."descontos"("data");

-- CreateIndex
CREATE INDEX "descontos_diarista_id_idx" ON "public"."descontos"("diarista_id");

-- CreateIndex
CREATE UNIQUE INDEX "fechamentos_periodo_id_diarista_id_key" ON "public"."fechamentos"("periodo_id", "diarista_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "public"."users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "public"."roles"("role_name");

-- CreateIndex
CREATE INDEX "auditoria_ts_idx" ON "public"."auditoria"("ts");

-- CreateIndex
CREATE INDEX "auditoria_usuario_idx" ON "public"."auditoria"("usuario");

-- CreateIndex
CREATE INDEX "auditoria_entidade_idx" ON "public"."auditoria"("entidade");

-- AddForeignKey
ALTER TABLE "public"."diaristas" ADD CONSTRAINT "diaristas_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "public"."funcoes"("funcao_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dias_trabalhados" ADD CONSTRAINT "dias_trabalhados_diarista_id_fkey" FOREIGN KEY ("diarista_id") REFERENCES "public"."diaristas"("diarista_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dias_trabalhados" ADD CONSTRAINT "dias_trabalhados_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "public"."funcoes"("funcao_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bonificacoes" ADD CONSTRAINT "bonificacoes_diarista_id_fkey" FOREIGN KEY ("diarista_id") REFERENCES "public"."diaristas"("diarista_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."descontos" ADD CONSTRAINT "descontos_diarista_id_fkey" FOREIGN KEY ("diarista_id") REFERENCES "public"."diaristas"("diarista_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fechamentos" ADD CONSTRAINT "fechamentos_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fechamentos" ADD CONSTRAINT "fechamentos_diarista_id_fkey" FOREIGN KEY ("diarista_id") REFERENCES "public"."diaristas"("diarista_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_perm_key_fkey" FOREIGN KEY ("perm_key") REFERENCES "public"."permissions"("perm_key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

