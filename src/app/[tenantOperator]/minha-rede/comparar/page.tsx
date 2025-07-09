'use client';

import { useParams } from 'next/navigation';

export default function TenantMinhaRedeCompararPage() {
  const { tenantOperator } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-foreground mb-6">Minha Rede: Comparar - {tenantOperator}</h1>
      <p className="text-lg text-muted-foreground">Comparar essa rede com qualquer outra.</p>
    </div>
  );
}
