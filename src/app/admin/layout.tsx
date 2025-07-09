'use client';

import { AdminNavbar } from '@/components/admin-navbar'; // Importe a Navbar
import { useAuth } from '@/contexts/AuthContext'; // Importe o useAuth para proteção do layout
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Proteção do layout: Redireciona se não for ROOT ou se a sessão ainda estiver carregando
  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ROOT')) {
      router.push('/login'); // Redireciona para o login
    }
  }, [user, isAuthLoading, router]);

  // Exibe um estado de carregamento enquanto o AuthContext verifica a sessão
  if (isAuthLoading || !user || user.role !== 'ROOT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary-foreground">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar /> {/* Sua Navbar administrativa será renderizada aqui */}
      <main className="flex-grow">
        {children} {/* O conteúdo das suas páginas /admin/* (incluindo admin/page.tsx) */}
      </main>
      {/* Opcional: Adicione um Footer administrativo aqui */}
    </div>
  );
}
