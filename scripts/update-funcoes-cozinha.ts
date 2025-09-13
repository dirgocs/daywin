import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import * as path from 'path'

/*
  Atualiza a tabela `funcoes` para reduzir as posições da cozinha
  às seguintes posições finais:
  - (Chef) Chefe/Chef de Cozinha
  - (Sous) Sous Chef/Sous-chef
  - Chefe de Praça
  - Cozinheiro
  - Auxiliar de Cozinha
  - Lavador

  Ações:
  1) NÃO renomeia grafias existentes desses dois papeis principais.
     Mantém "Chefe de Cozinha" se existir, e mantém "Sous-chef" se existir.
  2) Garante que essas posições existam (se ausentes, cria com grafia local: "Chefe de Cozinha" e "Sous-chef").
  3) Exclui (DELETE) funções de cozinha antigas/mais específicas que não estão nessa lista.

  Observação: Não altera pesos (pontos). Para itens criados novos, usa peso 1.0.
*/

// Inicializa Prisma com PGlite (driver adapter) para rodar local/offline
const dataDir = process.env.PGLITE_DATA_DIR || path.resolve(process.cwd(), 'daywin.db');
const pglite = new PGlite(dataDir);
const prisma = new PrismaClient({ adapter: new PrismaPGlite(pglite) as any });

// Categorias e variantes aceitas (mantemos a grafia existente)
const ACCEPTED_VARIANTS: Record<string, string[]> = {
  CHEF: ['Chef de Cozinha', 'Chefe de Cozinha'],
  SOUS: ['Sous Chef', 'Sous-chef'],
  PRACA: ['Chefe de Praça'],
  COZINHEIRO: ['Cozinheiro'],
  AUX: ['Auxiliar de Cozinha', 'Auxiliar'],
  LAVADOR: ['Lavador'],
};

const WEIGHTS: Record<keyof typeof ACCEPTED_VARIANTS, number> = {
  CHEF: 1.8,
  SOUS: 1.6,
  PRACA: 1.3,
  COZINHEIRO: 1.1,
  AUX: 0.9,
  LAVADOR: 0.8,
};

// Conjunto (possivelmente incompleto) de funções de cozinha "antigas" para remover
// Obs.: Não removemos funções de salão (ex.: Garçom, Maître, Faxineiro)
const OLD_KITCHEN = [
  'Chefe de Cozinha',
  'Chef de Cozinha',
  'Sous-chef',
  'Sous Chef',
  'Chef de Molhos',
  'Chef de Peixes',
  'Chef de Assados',
  'Chef de Grelhados',
  'Chef de Frituras',
  'Chef de Legumes e Ovos',
  'Chef de Frios e Saladas',
  'Confeiteiro',
  'Padeiro',
  'Sorveteiro',
  'Açougueiro',
  'Cozinheiro Coringa',
  'Expeditor',
];

async function main() {
  console.log('🔧 Iniciando ajuste de funções de cozinha...');

  // 1) Verificar quais variantes já existem para CHEF e SOUS, mantendo as grafias atuais
  const all = await prisma.funcao.findMany({ select: { funcao_nome: true } });
  const existingNames = new Set(all.map((f) => f.funcao_nome));

  // Para cada categoria, coletar todas as variantes existentes
  const existingByCategory: Record<string, string[]> = {
    CHEF: [], SOUS: [], PRACA: [], COZINHEIRO: [], AUX: [], LAVADOR: [],
  };
  for (const [cat, variants] of Object.entries(ACCEPTED_VARIANTS)) {
    existingByCategory[cat] = variants.filter((v) => existingNames.has(v));
  }

  // 2) Criar ausentes com grafia local (preferindo as presentes no seed atual)
  const CREATION_PREFERENCE: Record<string, string> = {
    CHEF: 'Chefe de Cozinha',
    SOUS: 'Sous-chef',
    PRACA: 'Chefe de Praça',
    COZINHEIRO: 'Cozinheiro',
    AUX: 'Auxiliar de Cozinha',
    LAVADOR: 'Lavador',
  };

  for (const [cat, existingList] of Object.entries(existingByCategory)) {
    if (existingList.length === 0) {
      const nameToCreate = CREATION_PREFERENCE[cat];
      await prisma.funcao.create({
        data: {
          funcao_nome: nameToCreate,
          peso_pontos: WEIGHTS[cat as keyof typeof WEIGHTS],
          ativo: true,
          color: 'default',
        },
      });
      console.log(`✅ Criada função ausente: ${nameToCreate}`);
      existingByCategory[cat] = [nameToCreate];
    }
  }

  // 3) Definir pesos de acordo com a hierarquia para todas as variantes aceitas presentes
  for (const [cat, variants] of Object.entries(ACCEPTED_VARIANTS)) {
    const rW = await prisma.funcao.updateMany({
      where: { funcao_nome: { in: variants } },
      data: { peso_pontos: WEIGHTS[cat as keyof typeof WEIGHTS] },
    });
    if (rW.count > 0) {
      console.log(`⚖️  Ajustados pesos de ${rW.count} função(ões) para categoria ${cat}.`);
    }
  }

  // 4) Remover funções de cozinha antigas não-permitidas (não remove Cumim ou funções de salão)
  const allowedNames = new Set(
    Object.values(existingByCategory).flat()
  );
  const deleteCandidates = OLD_KITCHEN.filter((n) => !allowedNames.has(n));
  if (deleteCandidates.length > 0) {
    const rDel = await prisma.funcao.deleteMany({
      where: { funcao_nome: { in: deleteCandidates } },
    });
    if (rDel.count > 0) {
      console.log(`🗑️  Excluídas ${rDel.count} função(ões) antigas de cozinha.`);
    } else {
      console.log('ℹ️ Nenhuma função antiga de cozinha encontrada para excluir.');
    }
  }

  // 5) Garantir que "Cumim" existe (função de salão)
  const cumimCount = await prisma.funcao.count({ where: { funcao_nome: 'Cumim' } });
  if (cumimCount === 0) {
    const max = await prisma.funcao.aggregate({ _max: { ordem: true } });
    const nextOrder = (max._max.ordem ?? 0) + 1;
    await prisma.funcao.create({
      data: {
        funcao_nome: 'Cumim',
        peso_pontos: 0.9,
        ativo: true,
        color: 'default',
        ordem: nextOrder,
      },
    });
    console.log('✅ Criada função de salão ausente: Cumim');
  }

  console.log('✅ Ajuste concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao ajustar funções:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
