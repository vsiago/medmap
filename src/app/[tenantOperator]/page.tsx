'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { Users, LayoutDashboard } from 'lucide-react'; // Ícones de exemplo

export default function TenantOperatorDashboardPage() {
  const { tenantOperator } = useParams(); // Obtém o identificador da operadora/tenant
  const { user } = useAuth(); // Obtém informações do usuário logado

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Bem-vindo ao Painel da Operadora <span className="text-primary">{tenantOperator}</span>
        </h1>

        <p className="text-center text-muted-foreground text-lg mb-12">
          Aqui você pode gerenciar os dados específicos da sua operadora.
        </p>

        <Separator className="my-8" />

        {/* Destaques/Métricas Principais (Exemplos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários da Operadora</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.234</div> {/* Dados mockados */}
              <p className="text-xs text-muted-foreground">
                Usuários ativos vinculados a esta operadora.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redes Credenciadas</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div> {/* Dados mockados */}
              <p className="text-xs text-muted-foreground">
                Redes de atendimento ativas.
              </p>
            </CardContent>
          </Card>

          {/* Adicione mais cards de métricas relevantes para a operadora */}
        </div>

        <Separator className="my-8" />

        {/* Informações do Usuário Logado (para referência) */}
        {user && (
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl">Suas Informações</CardTitle>
              <CardDescription>Detalhes do seu acesso.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Tenant ID:</strong> {user.tenantId}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Você está acessando o painel da operadora: <span className="font-semibold">{tenantOperator}</span>
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8">
          <Link href="/admin" className="text-primary hover:underline">
            ← Voltar para o Painel Global Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
