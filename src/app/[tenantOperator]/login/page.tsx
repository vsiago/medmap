'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TenantOperatorLoginPage() {
  const { tenantOperator } = useParams(); // Obtém o identificador da operadora/tenant
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Se já está autenticado e tem a role correta, redireciona para o dashboard do tenant
    if (!isAuthLoading && user) {
      const isRoot = user.role === 'ROOT';
      const isAdminOfThisTenant = user.role === 'ADMIN' && user.tenantId === tenantOperator;

      if (isRoot || isAdminOfThisTenant) {
        router.replace(`/${tenantOperator}`);
      } else {
        // Se logado mas sem permissão para este tenant, pode redirecionar para outro lugar
        // ou mostrar uma mensagem de acesso negado. Por enquanto, redireciona para o login global.
        router.replace('/login');
      }
    }
  }, [user, isAuthLoading, tenantOperator, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (!email || !password) {
      setLoginError('Por favor, preencha o email e a senha.');
      setIsLoggingIn(false);
      return;
    }

    try {
      // A função de login do AuthContext precisará ser capaz de lidar com o tenantId
      // ou o backend precisará validar se o usuário pertence ao tenant do URL.
      await login(email, password, tenantOperator as string); // Passa o tenantOperator para o login
      // O redirecionamento após o login bem-sucedido é tratado pelo useEffect acima
    } catch (err: any) {
      console.error('Erro no login:', err);
      setLoginError(err.message || 'Credenciais inválidas ou erro ao fazer login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Carregando...</CardTitle>
            <CardDescription className="text-center">Verificando sessão.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Se já está logado e tem permissão, o useEffect já redirecionou.
  // Se não está logado ou não tem permissão para este tenant, mostra o formulário de login.
  return (
    <main className="min-h-screen flex items-center justify-center bg-accent">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Login da Operadora</CardTitle>
          <CardDescription>
            Acesse o painel de <span className="font-semibold text-primary">{tenantOperator}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                {loginError}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <Link href="/login" className="underline hover:text-primary">
            Login Global (Super-Admin)
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
