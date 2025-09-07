import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma
let prisma;

async function initializeDatabase() {
  try {
    console.log('Initializing database connection...');
    
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    // Test connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Check if database needs initialization
    await initializeDatabaseSchema();
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

async function initializeDatabaseSchema() {
  try {
    // Check if users table exists by trying to count users
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);
    
    // If no users exist, create initial data
    if (userCount === 0) {
      console.log('Creating initial admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@daywin.com',
          login: 'admin',
          password_hash: hashedPassword,
          active: true
        }
      });
      
      console.log('Initial admin user created successfully');
    }
  } catch (error) {
    console.log('Database schema initialization:', error.message);
    // This is expected if tables don't exist yet
  }
}

// Session management
let currentUser = null;
let sessionTimeout = null;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: '',
      titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      resizable: true,
      
      titleBarOverlay: {
        color: '#1f1f23',
        symbolColor: '#ffffff',
        height: 32
      },
      icon: null,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(true);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Initialize database first
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    console.error('Failed to initialize database. Exiting...');
    app.quit();
    return;
  }
  
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
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

// Window control handlers
ipcMain.handle('window:minimize', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window:maximize', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  if (mainWindow) {
    mainWindow.close();
  }
});

// TODO: Add other IPC handlers for the application features

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
