'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import axios from 'axios'; // Importe o Axios para fazer a requisição HTTP
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
  const { tenantOperator } = useParams(); // Obtém o identificador da operadora/tenant (slug)
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login } = useAuth(); // Importa a função login do contexto

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // NOVO LOG: Verifica o estado de carregamento e usuário no componente de página
  console.log('TenantOperatorLoginPage Render - isAuthLoading:', isAuthLoading, 'User:', user, 'TenantOperator:', tenantOperator);

  useEffect(() => {
    // Se já está autenticado e tem a role correta, redireciona para o dashboard do tenant
    if (!isAuthLoading && user) {
      console.log('TenantOperatorLoginPage useEffect: Usuário autenticado, verificando redirecionamento.');
      const isRoot = user.role === 'ROOT';
      // Verifica se o usuário é ADMIN e se o tenantId do usuário corresponde ao slug da URL
      const isAdminOfThisTenant = user.role === 'ADMIN' && user.tenantId === tenantOperator;
      // Para outros roles (MANAGER, ANALYST, VIEWER), também verifica se o tenantId corresponde
      const isUserOfThisTenant = ['MANAGER', 'ANALYST', 'VIEWER'].includes(user.role) && user.tenantId === tenantOperator;

      if (isRoot) {
        console.log('TenantOperatorLoginPage useEffect: Redirecionando ROOT para /admin');
        router.replace('/admin'); // Redireciona ROOT para o painel de admin
      } else if (isAdminOfThisTenant || isUserOfThisTenant) {
        console.log(`TenantOperatorLoginPage useEffect: Redirecionando usuário do tenant ${tenantOperator} para /${tenantOperator}/dashboard`);
        router.replace(`/${tenantOperator}/dashboard`); // Redireciona para o dashboard do tenant
      } else {
        // Se logado mas sem permissão para este tenant, ou tenantId não corresponde,
        // pode redirecionar para o login global ou uma página de acesso negado.
        // Por segurança, redirecionar para o login global é uma boa prática.
        console.log('TenantOperatorLoginPage useEffect: Usuário logado mas sem permissão para este tenant. Redirecionando para /login.');
        router.replace('/login');
      }
    } else if (!isAuthLoading && !user) {
      console.log('TenantOperatorLoginPage useEffect: AuthContext terminou de carregar, e nenhum usuário logado. Exibindo formulário de login.');
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
      // 1. Faz a requisição POST para sua API de login
      // A API de login (src/app/api/auth/login/route.ts) deve validar o tenantId
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        tenantSlug: tenantOperator, // Envia o slug do tenant para a API
      });

      // 2. Verifica se a resposta da API foi bem-sucedida
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Falha no login. Credenciais inválidas.');
      }

      // 3. Se o login for bem-sucedido, obtém os dados do usuário e do tenant da resposta da API
      const userData = response.data; // A API deve retornar UserSession e TenantConfig
      
      // 4. Chama a função 'login' do AuthContext com os dados recebidos
      // O AuthContext vai persistir a sessão e o useEffect acima cuidará do redirecionamento
      login(userData, userData.tenantConfig); 

    } catch (err: any) {
      console.error('Erro no login:', err);
      // O Axios encapsula erros de resposta HTTP em err.response
      if (axios.isAxiosError(err) && err.response) {
        setLoginError(err.response.data.message || 'Credenciais inválidas ou erro ao fazer login.');
      } else {
        setLoginError(err.message || 'Ocorreu um erro inesperado ao fazer login.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Exibe um estado de carregamento enquanto o AuthContext verifica a sessão
  if (isAuthLoading) {
    console.log('TenantOperatorLoginPage: Renderizando tela de Carregando...');
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

  // NOVO LOG: Este log só será executado se isAuthLoading for false
  console.log('TenantOperatorLoginPage: isAuthLoading é false. Renderizando formulário de login.');

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
