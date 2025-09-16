// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth APIs
  auth: {
    login: (email, password) => ipcRenderer.invoke('auth:login', { email, password }),
    register: (username, email, password) => ipcRenderer.invoke('auth:register', { username, email, password }),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
    checkSession: () => ipcRenderer.invoke('auth:checkSession')
  },

  // Session APIs
  session: {
    extend: () => ipcRenderer.invoke('session:extend'),
    pingActivity: () => ipcRenderer.invoke('session:extend'), // Alias for extend - pings activity
    onTimeout: (callback) => ipcRenderer.on('session:timeout', callback),
    removeTimeoutListener: (callback) => ipcRenderer.removeListener('session:timeout', callback)
  },

  // Diaristas APIs
  diaristas: {
    create: (data) => ipcRenderer.invoke('diaristas:create', data),
    findAll: (filters) => ipcRenderer.invoke('diaristas:findAll', filters),
    findById: (id) => ipcRenderer.invoke('diaristas:findById', id),
    update: (id, data) => ipcRenderer.invoke('diaristas:update', id, data),
    delete: (id) => ipcRenderer.invoke('diaristas:delete', id)
  },

  // Funcoes APIs
  funcoes: {
    findAll: () => ipcRenderer.invoke('funcoes:findAll'),
    findAllActive: () => ipcRenderer.invoke('funcoes:findAllActive'),
    findById: (id) => ipcRenderer.invoke('funcoes:findById', id),
    create: (data) => ipcRenderer.invoke('funcoes:create', data),
    update: (data) => ipcRenderer.invoke('funcoes:update', data),
    updateOrder: (pairs) => ipcRenderer.invoke('funcoes:updateOrder', pairs),
    deactivate: (id) => ipcRenderer.invoke('funcoes:deactivate', id),
    activate: (id) => ipcRenderer.invoke('funcoes:activate', id),
    searchByName: (searchTerm) => ipcRenderer.invoke('funcoes:searchByName', searchTerm),
    nameExists: (nome, excludeId) => ipcRenderer.invoke('funcoes:nameExists', nome, excludeId),
    getStats: () => ipcRenderer.invoke('funcoes:getStats'),
    findByPointsRange: (minPontos, maxPontos) => ipcRenderer.invoke('funcoes:findByPointsRange', minPontos, maxPontos),
    findMostUsed: (limit) => ipcRenderer.invoke('funcoes:findMostUsed', limit)
  },

  // Dias Trabalhados APIs
  dias: {
    create: (data) => ipcRenderer.invoke('dias:create', data),
    findAll: (filters) => ipcRenderer.invoke('dias:findAll', filters),
    update: (id, data) => ipcRenderer.invoke('dias:update', id, data),
    delete: (id) => ipcRenderer.invoke('dias:delete', id)
  },

  // Bonificacoes APIs
  bonus: {
    create: (data) => ipcRenderer.invoke('bonus:create', data),
    findAll: (filters) => ipcRenderer.invoke('bonus:findAll', filters),
    update: (id, data) => ipcRenderer.invoke('bonus:update', id, data),
    delete: (id) => ipcRenderer.invoke('bonus:delete', id)
  },

  // Descontos APIs
  descontos: {
    create: (data) => ipcRenderer.invoke('descontos:create', data),
    findAll: (filters) => ipcRenderer.invoke('descontos:findAll', filters),
    update: (id, data) => ipcRenderer.invoke('descontos:update', id, data),
    delete: (id) => ipcRenderer.invoke('descontos:delete', id)
  },

  // Taxa Servico APIs
  taxa: {
    findAll: () => ipcRenderer.invoke('taxa:findAll'),
    create: (data) => ipcRenderer.invoke('taxa:create', data),
    update: (id, data) => ipcRenderer.invoke('taxa:update', id, data),
    delete: (id) => ipcRenderer.invoke('taxa:delete', id)
  },

  // Regras Taxa Servico APIs
  regras: {
    findAll: () => ipcRenderer.invoke('regras:findAll'),
    create: (data) => ipcRenderer.invoke('regras:create', data),
    update: (id, data) => ipcRenderer.invoke('regras:update', id, data),
    delete: (id) => ipcRenderer.invoke('regras:delete', id)
  },

  // Periodos APIs
  periodos: {
    create: (data) => ipcRenderer.invoke('periodos:create', data),
    findAll: (filters) => ipcRenderer.invoke('periodos:findAll', filters),
    findById: (id) => ipcRenderer.invoke('periodos:findById', id),
    update: (id, data) => ipcRenderer.invoke('periodos:update', id, data),
    close: (id) => ipcRenderer.invoke('periodos:close', id)
  },

  // Reports APIs
  reports: {
    diaristas: (filters) => ipcRenderer.invoke('reports:diaristas', filters),
    financeiro: (filters) => ipcRenderer.invoke('reports:financeiro', filters),
    periodo: (periodoId) => ipcRenderer.invoke('reports:periodo', periodoId),
    diasTrabalhadosPorDiarista: (params) => ipcRenderer.invoke('reports:diasTrabalhadosPorDiarista', params)
  },

  // Exports APIs
  exports: {
    excel: (data, filename) => ipcRenderer.invoke('exports:excel', data, filename),
    pdf: (data, filename) => ipcRenderer.invoke('exports:pdf', data, filename)
  },

  // Users APIs
  users: {
    create: (data) => ipcRenderer.invoke('users:create', data),
    findAll: (filters) => ipcRenderer.invoke('users:findAll', filters),
    update: (id, data) => ipcRenderer.invoke('users:update', id, data),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
    changePassword: (id, passwords) => ipcRenderer.invoke('users:changePassword', id, passwords)
  },

  // Settings APIs
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },

  // Roles APIs
  roles: {
    findAll: () => ipcRenderer.invoke('roles:findAll'),
    create: (data) => ipcRenderer.invoke('roles:create', data),
    update: (id, data) => ipcRenderer.invoke('roles:update', id, data),
    delete: (id) => ipcRenderer.invoke('roles:delete', id)
  },

  // Permissions APIs
  permissions: {
    findAll: () => ipcRenderer.invoke('permissions:findAll'),
    findByUser: (userId) => ipcRenderer.invoke('permissions:findByUser', userId)
  },

  // Audit APIs
  audit: {
    findAll: (filters) => ipcRenderer.invoke('audit:findAll', filters),
    findByEntity: (entityType, entityId) => ipcRenderer.invoke('audit:findByEntity', entityType, entityId)
  },

  // Backup APIs
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: (backupPath) => ipcRenderer.invoke('backup:restore', backupPath),
    list: () => ipcRenderer.invoke('backup:list')
  },

  // Window control APIs
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },

  // Title bar and platform APIs
  getPlatform: () => ipcRenderer.invoke('window:getPlatform'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  updateTitleBarTheme: (colors) => ipcRenderer.invoke('titlebar:updateTheme', colors),
  
  // Window state change listeners
  onWindowStateChanged: (callback) => ipcRenderer.on('window:state-changed', (event, state) => callback(state)),
  removeWindowStateListener: (callback) => ipcRenderer.removeListener('window:state-changed', callback),
  
  // Convenience methods for title bar component
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  unmaximizeWindow: () => ipcRenderer.invoke('window:maximize'), // Same handler toggles
  closeWindow: () => ipcRenderer.invoke('window:close')
});

// Expose version info
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});
