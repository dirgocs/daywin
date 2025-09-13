-- Add ordem column to funcoes and initialize
ALTER TABLE funcoes ADD COLUMN IF NOT EXISTS ordem INTEGER NOT NULL DEFAULT 0;

-- Initialize ordem for existing rows if still zero
UPDATE funcoes SET ordem = funcao_id WHERE ordem = 0;

