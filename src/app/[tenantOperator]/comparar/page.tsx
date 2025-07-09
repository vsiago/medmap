'use client';

import { useParams } from 'next/navigation';

export default function TenantCompararPage() {
  const { tenantOperator } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-foreground mb-6">Comparativos: Iniciar Nova Comparação - {tenantOperator}</h1>
      <p className="text-lg text-muted-foreground">Iniciar nova comparação entre operadoras (Excel ou seleção).</p>
    </div>
  );
}
