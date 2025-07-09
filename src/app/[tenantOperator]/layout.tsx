'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Assumindo que useAuth fornece user.tenantId e user.role
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Você pode criar uma Navbar específica para o Tenant aqui, similar à AdminNavbar
// import { TenantNavbar } from '@/components/tenant-navbar';

export default function TenantOperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenantOperator } = useParams(); // Obtém o identificador da operadora/tenant da URL
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth(); // Assumindo que useAuth tem logout

  useEffect(() => {
    // Se ainda estiver carregando a autenticação, não faz nada ainda
    if (isAuthLoading) {
      return;
    }

    // Se o usuário não está logado, redireciona para a página de login específica do tenant
    if (!user) {
      router.replace(`/${tenantOperator}/login`);
      return;
    }

    // Se o usuário está logado, verifica as permissões
    const isRoot = user.role === 'ROOT';
    const isAdminOfThisTenant = user.role === 'ADMIN' && user.tenantId === tenantOperator;

    if (!isRoot && !isAdminOfThisTenant) {
      // Se não é ROOT e não é ADMIN do tenant correto, redireciona para o login
      // ou para uma página de acesso negado genérica, dependendo da sua UX
      router.replace(`/${tenantOperator}/login?error=unauthorized`);
      // Opcional: fazer logout se o token for de um usuário de outro tenant
      // logout();
      return;
    }

    // Se chegou aqui, o usuário é ROOT ou ADMIN do tenant correto, então pode ver o conteúdo.
  }, [user, isAuthLoading, tenantOperator, router, logout]);

  // Exibe um estado de carregamento inicial para evitar flash de conteúdo não autorizado
  if (isAuthLoading || !user || (user.role === 'ADMIN' && user.tenantId !== tenantOperator && !user.isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary-foreground">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário é ROOT ou ADMIN do tenant correto, renderiza o layout
  return (
    <div className="flex flex-col min-h-screen">
      {/* Exemplo de Navbar para o Tenant - você pode criar um componente separado */}
      <nav className="flex items-center justify-between px-6 py-3 bg-secondary text-secondary-foreground shadow-md">
        <Link href={`/${tenantOperator}`} className="text-xl font-bold">
          Dashboard {tenantOperator}
        </Link>
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm">Olá, {user.name} ({user.role})</span>
          )}
          <Button onClick={logout} variant="outline" className="text-secondary-foreground">Sair</Button>
        </div>
      </nav>
      <main className="flex-grow">
        {children} {/* Aqui será renderizado o conteúdo de page.tsx ou outras sub-rotas */}
      </main>
      {/* Opcional: Footer do Tenant */}
    </div>
  );
}
