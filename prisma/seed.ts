import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Note: This seed will be executed via IPC when the app starts
// For now, we'll skip the seed and let the app handle initialization
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds do Daywin...');

  // 1. Criar todas as permissões do sistema
  const permissions = [
    // Cadastros
    { perm_key: 'diaristas.view', description: 'Visualizar diaristas' },
    { perm_key: 'diaristas.create', description: 'Criar diaristas' },
    { perm_key: 'diaristas.edit', description: 'Editar diaristas' },
    { perm_key: 'diaristas.delete', description: 'Excluir diaristas' },
    { perm_key: 'funcoes.view', description: 'Visualizar funções' },
    { perm_key: 'funcoes.create', description: 'Criar funções' },
    { perm_key: 'funcoes.edit', description: 'Editar funções' },
    { perm_key: 'funcoes.delete', description: 'Excluir funções' },
    
    // Lançamentos
    { perm_key: 'dias.view', description: 'Visualizar dias trabalhados' },
    { perm_key: 'dias.create', description: 'Criar dias trabalhados' },
    { perm_key: 'dias.edit', description: 'Editar dias trabalhados' },
    { perm_key: 'dias.delete', description: 'Excluir dias trabalhados' },
    { perm_key: 'bonus.view', description: 'Visualizar bonificações' },
    { perm_key: 'bonus.create', description: 'Criar bonificações' },
    { perm_key: 'bonus.edit', description: 'Editar bonificações' },
    { perm_key: 'bonus.delete', description: 'Excluir bonificações' },
    { perm_key: 'descontos.view', description: 'Visualizar descontos' },
    { perm_key: 'descontos.create', description: 'Criar descontos' },
    { perm_key: 'descontos.edit', description: 'Editar descontos' },
    { perm_key: 'descontos.delete', description: 'Excluir descontos' },
    { perm_key: 'taxa.view', description: 'Visualizar taxa de serviço' },
    { perm_key: 'taxa.create', description: 'Criar taxa de serviço' },
    { perm_key: 'taxa.edit', description: 'Editar taxa de serviço' },
    { perm_key: 'taxa.delete', description: 'Excluir taxa de serviço' },
    
    // Períodos
    { perm_key: 'periodos.view', description: 'Visualizar períodos' },
    { perm_key: 'periodos.create', description: 'Criar períodos' },
    { perm_key: 'periodos.close', description: 'Fechar períodos' },
    { perm_key: 'periodos.reopen', description: 'Reabrir períodos' },
    
    // Configurações
    { perm_key: 'regras.view', description: 'Visualizar regras' },
    { perm_key: 'regras.edit', description: 'Editar regras' },
    { perm_key: 'exports.run', description: 'Executar exportações' },
    { perm_key: 'backup.export', description: 'Exportar backup' },
    { perm_key: 'backup.restore', description: 'Restaurar backup' },
    { perm_key: 'users.manage', description: 'Gerenciar usuários' },
    { perm_key: 'audit.view', description: 'Visualizar auditoria' },
  ];

  console.log('📋 Criando permissões...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { perm_key: permission.perm_key },
      update: {},
      create: permission,
    });
  }

  // 2. Criar roles (papéis)
  console.log('👥 Criando roles...');
  
  // Role Gerente (todas as permissões)
  const gerenteRole = await prisma.role.upsert({
    where: { role_name: 'Gerente' },
    update: {},
    create: {
      role_name: 'Gerente',
      description: 'Acesso completo ao sistema',
    },
  });

  // Role Supervisor (subset de permissões)
  const supervisorRole = await prisma.role.upsert({
    where: { role_name: 'Supervisor' },
    update: {},
    create: {
      role_name: 'Supervisor',
      description: 'Acesso a lançamentos e fechamentos',
    },
  });

  // 3. Associar permissões aos roles
  console.log('🔗 Associando permissões aos roles...');
  
  // Gerente: todas as permissões
  const allPermissions = permissions.map(p => p.perm_key);
  for (const permKey of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_perm_key: {
          role_id: gerenteRole.role_id,
          perm_key: permKey,
        },
      },
      update: {},
      create: {
        role_id: gerenteRole.role_id,
        perm_key: permKey,
      },
    });
  }

  // Supervisor: subset de permissões (sem users.manage, regras.edit, backup.restore, periodos.reopen)
  const supervisorPermissions = allPermissions.filter(p => 
    !['users.manage', 'regras.edit', 'backup.restore', 'periodos.reopen'].includes(p)
  );
  
  for (const permKey of supervisorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_perm_key: {
          role_id: supervisorRole.role_id,
          perm_key: permKey,
        },
      },
      update: {},
      create: {
        role_id: supervisorRole.role_id,
        perm_key: permKey,
      },
    });
  }

  // 4. Criar usuário admin inicial
  console.log('👤 Criando usuário admin...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      login: 'admin',
      password_hash: adminPassword,
      email: 'admin@daywin.local',
      active: true,
    },
  });

  // Associar usuário admin ao role Gerente
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.user_id,
        role_id: gerenteRole.role_id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.user_id,
      role_id: gerenteRole.role_id,
    },
  });

  // 5. Criar regras padrão de taxa de serviço
  console.log('⚙️ Criando regras padrão...');
  await prisma.regrasTaxaServico.upsert({
    where: { regra_id: 1 },
    update: {},
    create: {
      modo: 'pontos_funcao',
      percentual_para_diaristas: 100.00,
      min_horas_para_eligibilidade: 4.00,
      arredondamento_cinquentavos: false,
    },
  });

  // 6. Criar configurações padrão
  console.log('🔧 Criando configurações padrão...');
  const defaultSettings = [
    { key: 'app.version', value: '1.0.0' },
    { key: 'session.timeout_minutes', value: '30' },
    { key: 'backup.auto_enabled', value: 'true' },
    { key: 'backup.auto_interval_hours', value: '24' },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // 7. Seed de Funções — Brigada Francesa (restaurante)
  console.log('👨‍🍳 Criando funções da brigada francesa (restaurante)...');
  const funcoesCount = await prisma.funcao.count();
  if (funcoesCount === 0) {
    const brigada = [
      // Cozinha
      { nome: 'Chefe de Cozinha', peso: 1.8 },
      { nome: 'Sous-chef', peso: 1.6 },
      { nome: 'Chef de Molhos', peso: 1.4 },
      { nome: 'Chef de Peixes', peso: 1.3 },
      { nome: 'Chef de Assados', peso: 1.3 },
      { nome: 'Chef de Grelhados', peso: 1.2 },
      { nome: 'Chef de Frituras', peso: 1.2 },
      { nome: 'Chef de Legumes e Ovos', peso: 1.2 },
      { nome: 'Chef de Frios e Saladas', peso: 1.2 },
      { nome: 'Confeiteiro', peso: 1.4 },
      { nome: 'Padeiro', peso: 1.2 },
      { nome: 'Sorveteiro', peso: 1.1 },
      { nome: 'Açougueiro', peso: 1.1 },
      { nome: 'Cozinheiro Coringa', peso: 1.1 },
      { nome: 'Cumim', peso: 0.9 },
      { nome: 'Lavador', peso: 0.8 },
      { nome: 'Expeditor', peso: 1.0 },
      // Salão/Serviço
      { nome: 'Garçom', peso: 1.0 },
      { nome: 'Faxineiro', peso: 0.9 },
      { nome: 'Maître', peso: 1.4 },
    ];

    await prisma.funcao.createMany({
      data: brigada.map((f) => ({
        funcao_nome: f.nome,
        peso_pontos: f.peso,
        ativo: true,
        color: 'default',
      })),
    });
    console.log('✅ Funções da brigada francesa criadas.');
  } else {
    console.log('ℹ️ Tabela de funções já possui registros; seed ignorado.');
  }

  // 7.1 Ajuste de nomenclatura legado (Mantenedor de Salão → Faxineiro)
  try {
    const updated = await prisma.funcao.updateMany({
      where: { funcao_nome: 'Mantenedor de Salão' },
      data: { funcao_nome: 'Faxineiro' },
    });
    if (updated.count > 0) {
      console.log(`🔤 Renomeadas ${updated.count} função(ões) para "Faxineiro".`);
    }
  } catch (e) {
    // silencioso
  }

  console.log('✅ Seeds concluídos com sucesso!');
  console.log('📝 Usuário admin criado:');
  console.log('   Login: admin');
  console.log('   Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
