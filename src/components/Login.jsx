import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        // Check if running in Electron or browser
        if (typeof window !== 'undefined' && window.electronAPI) {
          // Electron mode
          const result = await window.electronAPI.auth.register(
            formData.email,
            formData.email,
            formData.password
          );
          
          if (result.success) {
            onLogin(result.user);
          } else {
            setError(result.error || 'Erro ao criar conta');
          }
        } else {
          // Browser mode - mock implementation
          if (formData.email && formData.password) {
            const mockUser = {
              id: 1,
              name: formData.email,
              email: formData.email,
              login: formData.email,
              permissions: ['admin']
            };
            onLogin(mockUser);
          } else {
            setError('Email e senha são obrigatórios');
          }
        }
      } else {
        // Check if running in Electron or browser
        if (typeof window !== 'undefined' && window.electronAPI) {
          // Electron mode
          const result = await window.electronAPI.auth.login(
            formData.email,
            formData.password
          );
          
          if (result.success) {
            onLogin(result.user);
          } else {
            setError(result.error || 'Credenciais inválidas');
          }
        } else {
          // Browser mode - mock implementation
          if ((formData.email === 'admin' && formData.password === 'admin123') ||
              (formData.email && formData.password)) {
            const mockUser = {
              id: 1,
              name: formData.email === 'admin' ? 'Administrador' : formData.email,
              email: formData.email === 'admin' ? 'admin@daywin.com' : formData.email,
              login: formData.email,
              permissions: ['admin']
            };
            onLogin(mockUser);
          } else {
            setError('Credenciais inválidas. Use admin/admin123 ou qualquer email/senha');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro interno do sistema');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'admin', password: 'admin123' });
    // Trigger form submission with demo credentials
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center p-4" style={{ minHeight: '100vh' }}>
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? 'Criar Conta - Daywin' : 'Daywin'}
              </CardTitle>
              <CardDescription>
                {isSignUp ? 'Crie sua conta para acessar o sistema' : 'Sistema de Gestão de Diaristas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">{isSignUp ? 'Email' : 'Login'}</Label>
                    <Input
                      id="email"
                      name="email"
                      type={isSignUp ? 'email' : 'text'}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Digite sua senha"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  {isSignUp && (
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        required
                        disabled={loading}
                      />
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                  </Button>
                </div>
              </form>
              
              {!isSignUp && (
                <>
                  <div className="mt-4 text-center">
                    <span className="text-sm text-muted-foreground">
                      Não tem uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError('');
                          setFormData({ email: '', password: '' });
                          setConfirmPassword('');
                        }}
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Criar conta
                      </button>
                    </span>
                    <div className="mt-2">
                      <p>Usuário padrão: <span className="font-medium">admin</span></p>
                      <p>Senha padrão: <span className="font-medium">admin123</span></p>
                    </div>
                  </div>
                </>
              )}
              
              {isSignUp && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                        setFormData({ email: 'admin', password: '' });
                        setConfirmPassword('');
                      }}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Fazer login
                    </button>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;