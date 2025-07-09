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
import { PlusCircle, Edit, Trash2, Building as BuildingIcon, Users as UsersIcon } from "lucide-react"; // Importe ícones Lucide

interface Operator {
  id: string;
  name: string;
  cnpj: string;
  tenant: {
    name: string;
  };
  createdAt: string;
}

export default function AdminOperatorsDashboardPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
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
    const fetchOperators = async () => {
      if (!isAuthLoading && user && user.role === 'ROOT') {
        setIsLoading(true);
        setError('');
        try {
          const response = await axios.get('/api/admin/operators', {
            headers: {
              // 'Authorization': `Bearer ${user.token}`
            }
          });
          setOperators(response.data);
        } catch (err: any) {
          console.error('Erro ao buscar operadoras:', err);
          if (axios.isAxiosError(err) && err.response) {
            setError(err.response.data.message || 'Falha ao carregar operadoras.');
          } else {
            setError(err.message || 'Erro ao carregar operadoras.');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOperators();
  }, [user, isAuthLoading]);

  // Função para lidar com a exclusão de operadora (opcional, mas bom para CRUD)
  const handleDeleteOperator = async (operatorId: string, operatorName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a operadora "${operatorName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/operators/${operatorId}`, {
        headers: {
          // 'Authorization': `Bearer ${user?.token}`
        }
      });
      setOperators(prev => prev.filter(op => op.id !== operatorId));
      alert(`Operadora "${operatorName}" excluída com sucesso!`); // Use um toast real em produção
    } catch (err: any) {
      console.error('Erro ao excluir operadora:', err);
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'Falha ao excluir operadora.';
      alert(`Erro: ${errorMessage}`); // Use um toast real em produção
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
        <h1 className="text-4xl font-bold text-center text-primary mb-8">Gestão de Operadoras de Saúde</h1>

        {/* Destaques/Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card: Total de Operadoras */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Operadoras</CardTitle>
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded"></div>
              ) : error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : (
                <div className="text-2xl font-bold">{operators.length}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Operadoras de saúde cadastradas no sistema.
              </p>
            </CardContent>
          </Card>

          {/* Card: Atalho para Adicionar Nova Operadora */}
          <Card className="flex flex-col justify-center items-center p-6 text-center">
            <CardContent className="p-0 flex flex-col items-center justify-center h-full">
              <PlusCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Adicionar Nova Operadora</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Cadastre uma nova operadora de saúde.
              </CardDescription>
            </CardContent>
            <CardFooter className="p-0 pt-4 w-full">
              <Button asChild className="w-full">
                <Link href="/admin/operators/add">Adicionar</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Você pode adicionar mais Cards de destaque aqui */}
        </div>

        <Separator className="my-8" />

        {/* Lista de Operadoras em Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Operadoras Cadastradas</CardTitle>
            <CardDescription>Visualize e gerencie as operadoras de saúde.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Carregando operadoras...</div>
            ) : error ? (
              <p className="text-destructive text-center py-8">{error}</p>
            ) : operators.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma operadora cadastrada ainda. <Link href="/admin/operators/add" className="text-primary underline">Adicione uma agora!</Link></p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operators.map((operator) => (
                  <Card key={operator.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{operator.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">CNPJ: {operator.cnpj}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm flex-grow">
                      <p><strong>Tenant:</strong> {operator.tenant?.name || 'N/A'}</p>
                      <p><strong>Criado em:</strong> {new Date(operator.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/operators/${operator.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteOperator(operator.id, operator.name)}>
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
