-- Add color column to funcoes table
ALTER TABLE "funcoes" ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT 'default';
