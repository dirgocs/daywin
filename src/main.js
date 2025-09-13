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

// Função IPC Handlers
const funcaoRepo = new FuncaoRepository();

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
