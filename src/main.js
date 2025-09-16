import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { databaseService } from './services/database';
import bcrypt from 'bcryptjs';

// Session management
let currentUser = null;
let sessionTimeout = null;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window
  const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: '', // Remove window title text
      icon: null,
      frame: false, // Remove window frame completely
      backgroundColor: '#393940', // Matches sidebar background in dark theme
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    });

  // Show native title bar with menu bar hidden
  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
  // Listen for window state changes and notify renderer
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:state-changed', { isMaximized: true });
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:state-changed', { isMaximized: false });
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    await databaseService.initialize();
    createWindow();
  } catch (error) {
    console.error('Failed to initialize database. Exiting...', error);
    app.quit();
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Session management functions
function startSessionTimeout(mainWindow) {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }
  
  sessionTimeout = setTimeout(() => {
    currentUser = null;
    mainWindow.webContents.send('session:timeout');
  }, SESSION_DURATION);
}

function extendSession(mainWindow) {
  if (currentUser) {
    startSessionTimeout(mainWindow);
  }
}

// Auth IPC Handlers
ipcMain.handle('auth:login', async (event, { email, password }) => {
  try {
    const prisma = await databaseService.getClient();
    if (!prisma) {
      return { success: false, error: 'Database not initialized' };
    }
    
    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' };
    }
    
    const user = await prisma.user.findUnique({
      where: { login: email }, // Using login field for authentication (email input maps to login field)
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    if (!user.active) {
      return { success: false, error: 'Usuário inativo' };
    }

    // Extract permissions
    const permissions = user.user_roles.flatMap(ur => 
      ur.role.role_permissions.map(rp => rp.permission.perm_key)
    );

    currentUser = {
      id: user.user_id,
      name: user.name,
      email: user.email,
      login: user.login,
      permissions
    };

    // Start session timeout
    const mainWindow = BrowserWindow.getFocusedWindow();
    startSessionTimeout(mainWindow);

    // Log audit
    await prisma.auditoria.create({
      data: {
        usuario: user.login,
        acao: 'LOGIN',
        entidade: 'User',
        entidade_id: user.user_id.toString(),
        detalhes: { message: `Login realizado para ${user.email}` }
      }
    });

    return { success: true, user: currentUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
});

ipcMain.handle('auth:register', async (event, { username, email, password }) => {
  try {
    const prisma = await databaseService.getClient();
    if (!prisma) {
      return { success: false, error: 'Database not initialized' };
    }

    // Validações
    if (!username || !email || !password) {
      return { success: false, error: 'Todos os campos são obrigatórios' };
    }

    if (password.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { login: username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { success: false, error: 'Este email já está em uso' };
      }
      if (existingUser.login === username) {
        return { success: false, error: 'Este nome de usuário já está em uso' };
      }
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name: username,
        email: email,
        login: username,
        password_hash: hashedPassword,
        active: true
      }
    });

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        userId: newUser.id,
        acao: 'CREATE_USER',
        entidade: 'User',
        entidadeId: newUser.id.toString(),
        detalhes: `Novo usuário criado: ${email}`
      }
    });

    console.log('User registered successfully:', email);
    return { success: true, message: 'Usuário criado com sucesso' };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
});

ipcMain.handle('auth:logout', async (event) => {
  try {
    const prisma = await databaseService.getClient();
    if (!prisma) {
      return { success: false, error: 'Database not initialized' };
    }
    
    if (currentUser) {
      // Log audit
      await prisma.auditoria.create({
        data: {
          userId: currentUser.id,
          acao: 'LOGOUT',
          entidade: 'User',
          entidadeId: currentUser.id.toString(),
          detalhes: `Logout realizado para ${currentUser.email}`
        }
      });
    }

    currentUser = null;
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      sessionTimeout = null;
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
});

ipcMain.handle('auth:getCurrentUser', async (event) => {
  return currentUser;
});

ipcMain.handle('auth:checkSession', async (event) => {
  return { valid: !!currentUser, user: currentUser };
});

// Session IPC Handlers
ipcMain.handle('session:extend', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  extendSession(mainWindow);
  return { success: true };
});

// Window Controls IPC Handlers (for custom title bar)
ipcMain.handle('window:minimize', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  mainWindow.minimize();
  return { success: true };
});

ipcMain.handle('window:maximize', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  return { success: true, isMaximized: mainWindow.isMaximized() };
});

ipcMain.handle('window:close', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  mainWindow.close();
  return { success: true };
});

ipcMain.handle('window:isMaximized', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  return mainWindow.isMaximized();
});


import { FuncaoRepository } from './repositories/FuncaoRepository';
import { DiaristaRepository } from './repositories/DiaristaRepository';

// Função IPC Handlers
const funcaoRepo = new FuncaoRepository();
const diaristaRepo = new DiaristaRepository();

// Reports - Dias trabalhados por diarista (mês)
ipcMain.handle('reports:diasTrabalhadosPorDiarista', async (event, params) => {
  try {
    const prisma = await databaseService.getClient();
    const now = new Date();
    const year = Number(params?.year) || now.getFullYear();
    const monthZeroBased = (Number(params?.month) || now.getMonth() + 1) - 1; // 0-11
    const start = new Date(year, monthZeroBased, 1);
    const end = new Date(year, monthZeroBased + 1, 0);

    const rows = await prisma.$queryRaw`
      SELECT d.diarista_id, di.nome_completo as name, COUNT(*)::int as days
      FROM dias_trabalhados d
      JOIN diaristas di ON di.diarista_id = d.diarista_id
      WHERE d.data >= ${start} AND d.data <= ${end}
      GROUP BY d.diarista_id, di.nome_completo
      ORDER BY days DESC
    `;

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error reporting diasTrabalhadosPorDiarista:', error);
    return { success: false, error: error.message };
  }
});

// Reports - Gastos com diárias por mês (últimos 6 meses)
ipcMain.handle('reports:gastosMensais', async (event) => {
  try {
    const prisma = await databaseService.getClient();
    const now = new Date();
    const results = [];
    for (let i = 6; i >= 1; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const sum = await prisma.diaTrabalhado.aggregate({
        _sum: { diaria_valor: true },
        where: { data: { gte: start, lte: end } },
      });
      results.push({
        year: start.getFullYear(),
        month: start.getMonth() + 1,
        value: Number(sum._sum.diaria_valor || 0),
      });
    }
    return { success: true, data: results };
  } catch (error) {
    console.error('Error reporting gastosMensais:', error);
    return { success: false, error: error.message };
  }
});

// Reports - Diaristas por dia da semana (intervalo)
ipcMain.handle('reports:diaristasPorDiaSemana', async (event, params) => {
  try {
    const prisma = await databaseService.getClient();
    const start = new Date(params.start);
    const end = new Date(params.end);
    // Buscar todas as datas no intervalo e agregar no Node
    const rows = await prisma.diaTrabalhado.findMany({
      where: { data: { gte: start, lte: end } },
      select: { data: true },
    });
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const r of rows) {
      const dow = new Date(r.data).getDay(); // 0=Sun
      counts[dow] = (counts[dow] || 0) + 1;
    }
    return { success: true, data: counts };
  } catch (error) {
    console.error('Error reporting diaristasPorDiaSemana:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:findAllActive', async (event) => {
  try {
    const funcoes = await funcaoRepo.findAllActive();
    return { success: true, data: funcoes };
  } catch (error) {
    console.error('Error finding active functions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:findAll', async (event) => {
  try {
    const funcoes = await funcaoRepo.findAll();
    return { success: true, data: funcoes };
  } catch (error) {
    console.error('Error finding all functions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:findById', async (event, id) => {
  try {
    const funcao = await funcaoRepo.findById(id);
    return { success: true, data: funcao };
  } catch (error) {
    console.error('Error finding function by ID:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:create', async (event, data) => {
  try {
    const funcao = await funcaoRepo.create(data);
    
    // Log audit
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'CREATE',
          entidade: 'Funcao',
          entidade_id: funcao.id.toString(),
          detalhes: { nome: funcao.nome, pontos: funcao.pontos }
        }
      });
    }
    
    return { success: true, data: funcao };
  } catch (error) {
    console.error('Error creating function:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:update', async (event, data) => {
  try {
    const funcao = await funcaoRepo.update(data);
    
    // Log audit
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'UPDATE',
          entidade: 'Funcao',
          entidade_id: funcao.id.toString(),
          detalhes: data
        }
      });
    }
    
    return { success: true, data: funcao };
  } catch (error) {
    console.error('Error updating function:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:deactivate', async (event, id) => {
  try {
    const funcao = await funcaoRepo.deactivate(id);
    
    // Log audit
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'DEACTIVATE',
          entidade: 'Funcao',
          entidade_id: id.toString(),
          detalhes: { nome: funcao.nome }
        }
      });
    }
    
    return { success: true, data: funcao };
  } catch (error) {
    console.error('Error deactivating function:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:activate', async (event, id) => {
  try {
    const funcao = await funcaoRepo.activate(id);
    
    // Log audit
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'ACTIVATE',
          entidade: 'Funcao',
          entidade_id: id.toString(),
          detalhes: { nome: funcao.nome }
        }
      });
    }
    
    return { success: true, data: funcao };
  } catch (error) {
    console.error('Error activating function:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:searchByName', async (event, searchTerm) => {
  try {
    const funcoes = await funcaoRepo.searchByName(searchTerm);
    return { success: true, data: funcoes };
  } catch (error) {
    console.error('Error searching functions by name:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:nameExists', async (event, nome, excludeId) => {
  try {
    const exists = await funcaoRepo.nameExists(nome, excludeId);
    return { success: true, data: exists };
  } catch (error) {
    console.error('Error checking if name exists:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:getStats', async (event) => {
  try {
    const stats = await funcaoRepo.getStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting function stats:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:findByPointsRange', async (event, minPontos, maxPontos) => {
  try {
    const funcoes = await funcaoRepo.findByPointsRange(minPontos, maxPontos);
    return { success: true, data: funcoes };
  } catch (error) {
    console.error('Error finding functions by points range:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:findMostUsed', async (event, limit = 10) => {
  try {
    const funcoes = await funcaoRepo.findMostUsed(limit);
    return { success: true, data: funcoes };
  } catch (error) {
    console.error('Error finding most used functions:', error);
    return { success: false, error: error.message };
  }
});

// Diaristas IPC Handlers
ipcMain.handle('diaristas:findAll', async (event, filters) => {
  try {
    const diaristas = await diaristaRepo.findAllActive();
    return { success: true, data: diaristas };
  } catch (error) {
    console.error('Error finding diaristas:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('diaristas:findById', async (event, id) => {
  try {
    const diarista = await diaristaRepo.findById(Number(id));
    return { success: true, data: diarista };
  } catch (error) {
    console.error('Error finding diarista by ID:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('diaristas:create', async (event, data) => {
  try {
    const diarista = await diaristaRepo.create(data);
    if (currentUser) {
      const prisma = await databaseService.getClient();
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'CREATE',
          entidade: 'Diarista',
          entidade_id: String(diarista.diarista_id),
          detalhes: data,
        }
      });
    }
    return { success: true, data: diarista };
  } catch (error) {
    console.error('Error creating diarista:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('diaristas:update', async (event, id, data) => {
  try {
    const diarista = await diaristaRepo.update({ diarista_id: Number(id), ...data });
    if (currentUser) {
      const prisma = await databaseService.getClient();
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'UPDATE',
          entidade: 'Diarista',
          entidade_id: String(id),
          detalhes: data,
        }
      });
    }
    return { success: true, data: diarista };
  } catch (error) {
    console.error('Error updating diarista:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('diaristas:delete', async (event, id) => {
  try {
    const diarista = await diaristaRepo.deactivate(Number(id));
    if (currentUser) {
      const prisma = await databaseService.getClient();
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'DEACTIVATE',
          entidade: 'Diarista',
          entidade_id: String(id),
          detalhes: {},
        }
      });
    }
    return { success: true, data: diarista };
  } catch (error) {
    console.error('Error deleting diarista:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('funcoes:updateOrder', async (event, pairs) => {
  try {
    const result = await funcaoRepo.updateOrder(pairs || []);
    // Audit log simplificado
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'REORDER',
          entidade: 'Funcao',
          entidade_id: 'bulk',
          detalhes: { pairs }
        }
      });
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating functions order:', error);
    return { success: false, error: error.message };
  }
});

// Dias Trabalhados (mínimo necessário para criação)
ipcMain.handle('dias:create', async (event, data) => {
  try {
    const prisma = await databaseService.getClient();
    const created = await prisma.diaTrabalhado.create({
      data: {
        data: new Date(data.data),
        diarista_id: Number(data.diarista_id),
        funcao_id: data.funcao_id ? Number(data.funcao_id) : null,
        horas_trabalhadas: Number(data.horas_trabalhadas ?? 0),
        diaria_valor: Number(data.diaria_valor ?? 0),
        observacoes: data.observacoes ?? null,
      }
    });

    // Converter para objeto serializável
    const serializedData = {
      lanc_id: created.lanc_id.toString(),
      data: created.data.toISOString(),
      diarista_id: created.diarista_id,
      funcao_id: created.funcao_id,
      horas_trabalhadas: Number(created.horas_trabalhadas),
      diaria_valor: Number(created.diaria_valor),
      observacoes: created.observacoes
    };

    // Log de auditoria
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: 'CREATE',
          entidade: 'DiaTrabalhado',
          entidade_id: created.lanc_id.toString(),
          detalhes: {
            diarista_id: created.diarista_id,
            data: created.data.toISOString(),
            valor: Number(created.diaria_valor)
          }
        }
      });
    }

    return { success: true, data: serializedData };
  } catch (error) {
    console.error('Error creating dia trabalhado:', error);
    return { success: false, error: error.message };
  }
});

// Settings
ipcMain.handle('settings:get', async (event, key) => {
  try {
    const prisma = await databaseService.getClient();
    const row = await prisma.settings.findUnique({ where: { key } });
    return { success: true, data: row ? row.value : null };
  } catch (error) {
    console.error('Error getting setting:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:set', async (event, key, value) => {
  try {
    const prisma = await databaseService.getClient();
    const saved = await prisma.settings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    return { success: true, data: saved };
  } catch (error) {
    console.error('Error setting value:', error);
    return { success: false, error: error.message };
  }
});

// Diárias a Pagar handlers
ipcMain.handle('get-dias-trabalhados-pendentes', async (event) => {
  try {
    const prisma = await databaseService.getClient();
    const dias = await prisma.diaTrabalhado.findMany({
      where: {
        // TODO: Adicionar campo 'pago' ao schema se necessário
        // pago: false
      },
      include: {
        diarista: true,
        funcao: true
      },
      orderBy: {
        data: 'desc'
      }
    });
    return { success: true, data: dias };
  } catch (error) {
    console.error('Error fetching dias trabalhados pendentes:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-bonificacoes-pendentes', async (event) => {
  try {
    const prisma = await databaseService.getClient();
    const bonificacoes = await prisma.bonificacao.findMany({
      where: {
        // TODO: Adicionar campo 'pago' ao schema se necessário
        // pago: false
      },
      include: {
        diarista: true
      },
      orderBy: {
        data: 'desc'
      }
    });
    return { success: true, data: bonificacoes };
  } catch (error) {
    console.error('Error fetching bonificacoes pendentes:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-descontos-pendentes', async (event) => {
  try {
    const prisma = await databaseService.getClient();
    const descontos = await prisma.desconto.findMany({
      where: {
        // TODO: Adicionar campo 'pago' ao schema se necessário
        // pago: false
      },
      include: {
        diarista: true
      },
      orderBy: {
        data: 'desc'
      }
    });
    return { success: true, data: descontos };
  } catch (error) {
    console.error('Error fetching descontos pendentes:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-taxas-servico-pendentes', async (event) => {
  try {
    const prisma = await databaseService.getClient();
    const taxas = await prisma.taxaServico.findMany({
      where: {
        // TODO: Adicionar campo 'distribuido' ao schema se necessário
        // distribuido: false
      },
      orderBy: {
        data: 'desc'
      }
    });
    return { success: true, data: taxas };
  } catch (error) {
    console.error('Error fetching taxas servico pendentes:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-pagamento-diarista', async (event, { diaristaId, pago }) => {
  try {
    const prisma = await databaseService.getClient();

    // TODO: Implementar lógica de marcação de pagamento
    // Por enquanto, vamos simular o update
    // Seria necessário adicionar campos 'pago' nas tabelas ou criar uma tabela de controle de pagamentos

    // Log de auditoria
    if (currentUser) {
      await prisma.auditoria.create({
        data: {
          usuario: currentUser.login,
          acao: pago ? 'MARCAR_PAGO' : 'DESMARCAR_PAGO',
          entidade: 'PagamentoDiarista',
          entidade_id: diaristaId.toString(),
          detalhes: { diaristaId, pago, timestamp: new Date() }
        }
      });
    }

    return { success: true, data: { diaristaId, pago } };
  } catch (error) {
    console.error('Error updating pagamento diarista:', error);
    return { success: false, error: error.message };
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
