'use client';

import { useParams } from 'next/navigation';

export default function TenantDashboardPage() {
  const { tenantOperator } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-foreground mb-6">Painel Inicial - {tenantOperator}</h1>
      <p className="text-lg text-muted-foreground">Visão geral com cards de métricas.</p>
    </div>
  );
}
