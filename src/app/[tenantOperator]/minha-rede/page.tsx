'use client';

import { useParams } from 'next/navigation';

export default function TenantMinhaRedeEditarPage() {
  const { tenantOperator } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-foreground mb-6">Minha Rede: Editar/Importar - {tenantOperator}</h1>
      <p className="text-lg text-muted-foreground">Editar ou importar dados da rede coringa.</p>
    </div>
  );
}
