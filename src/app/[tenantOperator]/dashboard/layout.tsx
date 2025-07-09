'use client';

import { useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// Removido: import { TenantSidebar } from '@/components/tenant-sidebar'; // A sidebar será movida para o layout do dashboard

export default function TenantOperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenantOperator } = useParams(); // Obtém o identificador da operadora/tenant da URL (slug)
  const router = useRouter();
  const pathname = usePathname(); // Obtém o caminho atual da URL
  const { user, isLoading: isAuthLoading, logout, tenantConfig } = useAuth();

  useEffect(() => {
    // Se ainda estiver carregando a autenticação ou a configuração do tenant, não faz nada ainda
    console.log('Layout useEffect: isAuthLoading', isAuthLoading, 'user', user, 'tenantConfig', tenantConfig);
    if (isAuthLoading) {
      return;
    }

    // Define o caminho completo esperado para a página de login do tenant
    const tenantLoginPath = `/${tenantOperator}/login`;

    // Se o usuário não está logado
    if (!user) {
      // E a URL atual NÃO é a página de login do tenant, então redireciona
      if (pathname !== tenantLoginPath) {
        console.log(`Layout: Usuário não logado, redirecionando para ${tenantLoginPath}`);
        router.replace(tenantLoginPath);
      } else {
        console.log(`Layout: Usuário não logado, já está na página de login do tenant. Não redirecionando.`);
      }
      return; // Importante retornar para evitar execução desnecessária
    }

    // Se o usuário está logado, verifica as permissões
    const isRoot = user.role === 'ROOT';

    // A validação para usuários de tenant agora usa tenantConfig.id
    // Certifique-se de que tenantConfig está carregado antes de usar tenantConfig.id
    const isUserOfCorrectTenant = tenantConfig && user.tenantId === tenantConfig.id;

    // Se o usuário está logado, mas não é ROOT e não pertence a este tenant
    if (!isRoot && !isUserOfCorrectTenant) {
      console.log(`Layout: Usuário logado (${user.email}, Role: ${user.role}, TenantId: ${user.tenantId}) não tem permissão para o tenant do slug ${tenantOperator}. Redirecionando para login do tenant.`);
      router.replace(tenantLoginPath + '?error=unauthorized');
      // Opcional: fazer logout se o token for de um usuário de outro tenant
      // logout(); // Descomente se quiser forçar o logout aqui
      return;
    }

    // Se o usuário é ROOT e está tentando acessar um dashboard de tenant, redireciona para o admin
    // Isso evita que ROOTs fiquem presos em dashboards de tenant se o tenantId do user for nulo
    if (isRoot && !pathname.startsWith('/admin')) { // Ajustado para verificar se já não está em /admin
      console.log('Layout: Usuário ROOT logado. Redirecionando para /admin');
      router.replace('/admin');
      return;
    }

    // Se o usuário é ADMIN/MANAGER/ANALYST/VIEWER do tenant correto e está na página de login, redireciona para o dashboard
    // Esta condição só deve ser avaliada se o tenantConfig já estiver carregado e o user.tenantId corresponder
    const tenantDashboardPath = `/${tenantOperator}/dashboard`;
    if (isUserOfCorrectTenant && pathname === tenantLoginPath) {
        console.log(`Layout: Usuário do tenant ${tenantOperator} logado. Redirecionando para ${tenantDashboardPath}`);
        router.replace(tenantDashboardPath);
        return;
    }

    console.log('Layout: Autenticação e permissões verificadas. Renderizando children.');

  }, [user, isAuthLoading, tenantOperator, router, pathname, logout, tenantConfig]); // Adicione tenantConfig às dependências

  // Exibe um estado de carregamento inicial para evitar flash de conteúdo não autorizado
  // A condição de carregamento foi ajustada para incluir a espera pelo tenantConfig
  // Se user existe, não é ROOT, e não tem tenantConfig ou o tenantId não bate, ainda está carregando/verificando
  if (isAuthLoading || (user && user.role !== 'ROOT' && (!tenantConfig || user.tenantId !== tenantConfig.id))) {
    console.log('Layout: Renderizando tela de Carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary">
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

  // Se o usuário é ROOT ou ADMIN/VIEWER/ANALYST/MANAGER do tenant correto, renderiza o conteúdo
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-grow">
        {children} {/* O conteúdo das suas páginas, incluindo o login ou o dashboard */}
      </main>
    </div>
  );
}
