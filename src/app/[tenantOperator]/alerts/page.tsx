'use client';

import { useParams } from 'next/navigation';

export default function TenantAlertsPage() {
  const { tenantOperator } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-foreground mb-6">Alertas e Sugestões - {tenantOperator}</h1>
      <p className="text-lg text-muted-foreground">Sugestões de expansão, cidades críticas, gaps relevantes.</p>
    </div>
  );
}
