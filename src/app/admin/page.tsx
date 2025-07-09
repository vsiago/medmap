'use client'; // Indica que este é um Client Component

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Importe seu hook de autenticação
import { useRouter } from 'next/navigation'; // Para redirecionamento
import Link from 'next/link';
import axios from 'axios'; // Importe o Axios

// Importações dos componentes Shadcn/UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Útil para separar seções

// Interface para a Operadora (apenas o necessário para contagem)
interface Operator {
  id: string;
  // Outros campos não necessários para este dashboard
}

export default function AdminDashboardPage() {
  const [totalOperators, setTotalOperators] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null); // Novo estado para total de usuários
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Proteção da rota: Apenas usuários ROOT podem acessar esta página
  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ROOT')) {
      router.push('/login'); // Redireciona se não for ROOT
    }
  }, [user, isAuthLoading, router]);

  // Efeito para carregar o total de operadoras e usuários
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Só busca se o usuário for ROOT e o AuthContext já carregou
      if (!isAuthLoading && user && user.role === 'ROOT') {
        setIsLoadingData(true);
        setDataError('');
        try {
          // --- Busca Total de Operadoras ---
          const operatorsResponse = await axios.get('/api/admin/operators', {
            headers: {
              // Inclua o token de autorização se sua API de operators exigir
              // 'Authorization': `Bearer ${user.token}` // Exemplo: se o token estiver no user do contexto
            }
          });
          const operatorsList: Operator[] = operatorsResponse.data;
          setTotalOperators(operatorsList.length);

          // --- Busca Total de Usuários ---
          // Consumindo o endpoint /api/admin/users/count
          const usersResponse = await axios.get('/api/admin/users/count', {
            headers: {
              // 'Authorization': `Bearer ${user.token}` // Exemplo: se o token estiver no user do contexto
            }
          });
          setTotalUsers(usersResponse.data.count); // Axios retorna a resposta no objeto 'data'

        } catch (err: any) {
          console.error('Erro ao buscar dados do dashboard:', err);
          // O Axios encapsula erros de resposta HTTP em err.response
          if (axios.isAxiosError(err) && err.response) {
            setDataError(err.response.data.message || 'Falha ao carregar dados do dashboard.');
          } else {
            setDataError(err.message || 'Erro ao carregar dados do dashboard.');
          }
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchDashboardData();
  }, [user, isAuthLoading]); // Depende do usuário e do estado de carregamento do AuthContext

  // Exibe um estado de carregamento enquanto o AuthContext verifica a sessão
  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Carregando...</CardTitle>
            <CardDescription className="text-center">Verificando permissões de administrador.</CardDescription>
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

  // Se o usuário não é ROOT, redireciona pelo useEffect, este é um fallback visual
  if (!user || user.role !== 'ROOT') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Acesso Negado</CardTitle>
            <CardDescription className="text-center">Você não tem permissão para acessar esta página.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Link href="/login" className="underline text-primary">Voltar para o Login</Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Se o usuário é ROOT, mostra o conteúdo da página
  return (
    <main className="min-h-screen bg-accent p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">Painel de Super-Administrador</h1>

        {/* Destaques/Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Total de Operadoras */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Operadoras</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87m-3-1.13a4 4 0 0 1 4-4v-2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded"></div>
              ) : dataError ? (
                <p className="text-destructive text-sm">{dataError}</p>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalOperators !== null ? totalOperators : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Operadoras de saúde cadastradas no sistema.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* NOVO CARD: Total de Usuários */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87m-3-1.13a4 4 0 0 1 4-4v-2" />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded"></div>
              ) : dataError ? (
                <p className="text-destructive text-sm">{dataError}</p>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalUsers !== null ? totalUsers : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de usuários registrados na plataforma.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Você pode adicionar mais Cards para outras métricas aqui, como Total de Tenants, etc. */}
        </div>

        <Separator className="my-8" />

        {/* Atalhos Principais */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl">Atalhos Rápidos</CardTitle>
            <CardDescription>Acesse as principais funcionalidades de administração.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-auto py-4">
              <Link href="/admin/operators" className='flex flex-col'>
                <span className="text-lg font-semibold text-white">Gerenciar Operadoras</span>
                <span className="text-sm text-muted-foreground block">Crie e visualize operadoras de saúde.</span>
              </Link>
            </Button>
            <Button asChild className="h-auto py-4">
              <Link href="/admin/tenants" className='flex flex-col'>
                <span className="text-lg font-semibold text-white">Gerenciar Tenants</span>
                <span className="text-sm text-muted-foreground block">Crie e configure os clientes da plataforma.</span>
              </Link>
            </Button>
            <Button asChild className="h-auto py-4">
              <Link href="/admin/register-root" className='flex flex-col'>
                <span className="text-lg font-semibold text-white">Cadastrar Usuário ROOT</span>
                <span className="text-sm text-muted-foreground block">Crie novas contas de super-administrador.</span>
              </Link>
            </Button>
            {/* Adicione outros atalhos conforme necessário */}
          </CardContent>
        </Card>

        {/* Exemplo de Card para informações do usuário logado (opcional) */}
        {user && (
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl">Informações do Usuário</CardTitle>
              <CardDescription>Seus detalhes de acesso.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Role:</strong> {user.role}</p>
              {user.tenantId && <p><strong>Tenant ID:</strong> {user.tenantId}</p>}
              <Button variant="outline" className="mt-4" onClick={user.logout}>Sair</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
