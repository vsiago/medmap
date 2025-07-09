import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Seus estilos globais
import { AuthProvider } from '@/contexts/AuthContext'; // Importe seu AuthProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedMap - Rede Assistencial',
  description: 'Análise e comparação de redes assistenciais de operadoras de saúde.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Envolva toda a aplicação com o AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}