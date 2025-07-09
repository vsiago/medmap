'use client';

import { useParams } from 'next/navigation';

export default function TenantMapaPage() {
  const { tenantOperator } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-foreground mb-6">Mapa Interativo - {tenantOperator}</h1>
      <p className="text-lg text-muted-foreground">Mapa interativo com filtros por tipo, cidade, operadora.</p>
    </div>
  );
}
