'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash2, Building as BuildingIcon, ExternalLink, CheckCircle2, PauseCircle } from "lucide-react"; // Importe ícones Lucide

// O modelo Tenant agora inclui todos os campos da antiga Operadora
interface Tenant {
  id: string;
  name: string;
  slug: string; // Novo campo
  logoUrl: string | null; // Novo campo
  color: string | null; // Novo campo
  cnpj: string;
  address: string | null;
  addressComplement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  isPremiumSubscriber: boolean; // Novo campo
  isPaused: boolean;            // Novo campo
  createdAt: string;
}

export default function AdminTenantsDashboardPage() { // Renomeado para AdminTenantsDashboardPage
  const [tenants, setTenants] = useState<Tenant[]>([]); // Alterado de operators para tenants
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ROOT')) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchTenants = async () => { // Alterado de fetchOperators para fetchTenants
      if (!isAuthLoading && user && user.role === 'ROOT') {
        setIsLoading(true);
        setError('');
        try {
          // CORRIGIDO: Chamada para a nova API de listagem de Tenants
          const response = await axios.get('/api/admin/tenants', {
            headers: {
              // 'Authorization': `Bearer ${user.token}`
            }
          });
          setTenants(response.data); // Alterado de setOperators para setTenants
        } catch (err: any) {
          console.error('Erro ao buscar tenants:', err); // Mensagem de erro atualizada
          if (axios.isAxiosError(err) && err.response) {
            setError(err.response.data.message || 'Falha ao carregar tenants.'); // Mensagem de erro atualizada
          } else {
            setError(err.message || 'Erro ao carregar tenants.'); // Mensagem de erro atualizada
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTenants();
  }, [user, isAuthLoading]);

  // Função para lidar com a exclusão de Tenant
  const handleDeleteTenant = async (tenantId: string, tenantName: string) => { // Alterado para handleDeleteTenant
    if (!confirm(`Tem certeza que deseja excluir o Tenant "${tenantName}" (e todos os dados associados, incluindo usuários e redes)?`)) {
      return;
    }

    try {
      // CORRIGIDO: Chamada para a nova API de exclusão de Tenant
      await axios.delete(`/api/admin/tenants/${tenantId}`, {
        headers: {
          // 'Authorization': `Bearer ${user?.token}`
        }
      });
      setTenants(prev => prev.filter(t => t.id !== tenantId)); // Alterado de setOperators para setTenants
      alert(`Tenant "${tenantName}" excluído com sucesso!`); // Mensagem de sucesso atualizada
    } catch (err: any) {
      console.error('Erro ao excluir tenant:', err); // Mensagem de erro atualizada
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'Falha ao excluir tenant.'; // Mensagem de erro atualizada
      alert(`Erro: ${errorMessage}`);
    }
  };

  if (isAuthLoading || !user || user.role !== 'ROOT') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Carregando...</CardTitle>
            <CardDescription className="text-center">Verificando permissões de administrador.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-accent p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">Gestão de Tenants (Operadoras)</h1>

       {/* Destaques/Métricas Principais */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {/* Card: Total de Tenants */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total de Tenants</CardTitle>
      <BuildingIcon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded" />
      ) : error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : (
        <div className="text-2xl font-bold">{tenants.length}</div>
      )}
      <p className="text-xs text-muted-foreground">
        Tenants (Operadoras) cadastradas no sistema.
      </p>
    </CardContent>
  </Card>

  {/* Card: Atalho para Adicionar Novo Tenant */}
  <Card className="flex flex-col justify-center items-center p-6 text-center">
    <CardContent className="p-0 flex flex-col items-center justify-center h-full">
      <PlusCircle className="h-8 w-8 text-primary mb-2" />
      <CardTitle className="text-lg">Adicionar Novo Tenant</CardTitle>
      <CardDescription className="text-sm text-muted-foreground mt-1">
        Cadastre um novo Tenant (Operadora) de saúde.
      </CardDescription>
    </CardContent>
    <CardFooter className="p-0 pt-4 w-full">
      <Button asChild className="w-full">
        <Link href="/admin/tenants/add">Adicionar</Link>
      </Button>
    </CardFooter>
  </Card>

  {/* Adicione mais cards de destaque aqui, se necessário */}
</div>


        <Separator className="my-8" />

        {/* Lista de Tenants em Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tenants Cadastrados</CardTitle>
            <CardDescription>Visualize e gerencie os Tenants (Operadoras) de saúde.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Carregando tenants...</div>
            ) : error ? (
              <p className="text-destructive text-center py-8">{error}</p>
            ) : tenants.length === 0 ? ( // Alterado de operators.length para tenants.length
              <p className="text-center text-muted-foreground py-8">Nenhum tenant cadastrado ainda. <Link href="/admin/tenants/add" className="text-primary underline">Adicione um agora!</Link></p> // Mensagem e link atualizados
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => ( // Alterado de operators.map((operator) para tenants.map((tenant)
                  <Card key={tenant.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3 mb-2">
                        {tenant.logoUrl && (
                          <img src={tenant.logoUrl} alt={`${tenant.name} Logo`} className="h-8 w-8 rounded-full object-contain" onError={(e) => (e.currentTarget.src = `https://placehold.co/32x32/cccccc/000000?text=Logo`)} />
                        )}
                        <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      </div>
                      {tenant.color && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: tenant.color }}></div>
                          Cor: {tenant.color}
                        </div>
                      )}
                      <CardDescription className="text-sm text-muted-foreground">CNPJ: {tenant.cnpj}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm flex-grow">
                      <p className="flex items-center">
                          <strong>Slug:</strong> {tenant.slug}
                          <Button variant="ghost" size="icon" asChild className="ml-2 h-6 w-6">
                            <Link href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer" title={`Acessar painel ${tenant.name}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </p>
                      {tenant.address && <p><strong>Endereço:</strong> {tenant.address}, {tenant.city} - {tenant.state}</p>}
                      {tenant.phone && <p><strong>Telefone:</strong> {tenant.phone}</p>}
                      <p>
                        <strong>Assinatura:</strong> {tenant.isPremiumSubscriber ? <CheckCircle2 className="inline h-4 w-4 text-green-500 mr-1" /> : ''}
                        {tenant.isPremiumSubscriber ? 'Premium' : 'Básica'}
                      </p>
                      <p>
                        <strong>Status:</strong> {tenant.isPaused ? <PauseCircle className="inline h-4 w-4 text-orange-500 mr-1" /> : ''}
                        {tenant.isPaused ? 'Pausado' : 'Ativo'}
                      </p>
                      <p><strong>Criado em:</strong> {new Date(tenant.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/tenants/${tenant.id}/edit`}> {/* Link corrigido */}
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTenant(tenant.id, tenant.name)}> {/* Função de exclusão corrigida */}
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/admin" className="text-primary hover:underline">
            ← Voltar para o Painel Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
