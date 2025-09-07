import React, { useState, useEffect } from 'react';
import Login from './Login';
import AppLayout from './AppLayout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          // Electron environment
          const sessionData = await window.electronAPI.auth.checkSession();
          if (sessionData.user) {
            setUser(sessionData.user);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const checkSession = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const sessionData = await window.electronAPI.auth.checkSession();
        if (!sessionData.user) {
          setUser(null);
        } else if (sessionData.warning) {
          setSessionWarning(true);
          setTimeout(() => {
            if (sessionWarning) {
              handleLogout();
            }
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setSessionWarning(false);
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setSessionWarning(false);
    }
  };

  const extendSession = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.extendSession();
        setSessionWarning(false);
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App relative">
      {sessionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-amber-600">Sessão Expirando</CardTitle>
              <CardDescription>
                Sua sessão expirará em 5 segundos por inatividade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={extendSession} className="flex-1">
                  Continuar Sessão
                </Button>
                <Button onClick={handleLogout} variant="outline" className="flex-1">
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {user ? (
        <AppLayout user={user} onLogout={handleLogout}>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo ao sistema de gestão de diaristas Daywin
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Total de Diaristas</h3>
                </div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhuma diarista cadastrada
                </p>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Dias Trabalhados</h3>
                </div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Receita Total</h3>
                </div>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Pendências</h3>
                </div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhuma pendência
                </p>
              </div>
            </div>
          </div>
        </AppLayout>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;