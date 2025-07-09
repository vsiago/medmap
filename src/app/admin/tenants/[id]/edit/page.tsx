'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useParams } from 'next/navigation'; // Para obter o ID da URL
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react"; // Ícone de voltar

interface Tenant {
  id: string;
  name: string;
}

interface Operator {
  id: string;
  name: string;
  cnpj: string;
  logo: string; // Novo campo
  color: string; // Novo campo
  tenantId: string;
  address: string | null; // Novo campo
  addressComplement: string | null; // Novo campo
  neighborhood: string | null; // Novo campo
  city: string | null; // Novo campo
  state: string | null; // Novo campo
  zipCode: string | null; // Novo campo
  phone: string | null; // Novo campo
  createdAt: string;
}

export default function EditOperatorPage() {
  const { id } = useParams(); // Obtém o ID da operadora da URL
  const operatorId = typeof id === 'string' ? id : id?.[0]; // Garante que 'id' é string

  // Estados da Operadora
  const [operatorName, setOperatorName] = useState('');
  const [operatorCnpj, setOperatorCnpj] = useState('');
  const [operatorLogo, setOperatorLogo] = useState('');
  const [operatorColor, setOperatorColor] = useState('');
  const [operatorAddress, setOperatorAddress] = useState('');
  const [operatorAddressComplement, setOperatorAddressComplement] = useState('');
  const [operatorNeighborhood, setOperatorNeighborhood] = useState('');
  const [operatorCity, setOperatorCity] = useState('');
  const [operatorState, setOperatorState] = useState('');
  const [operatorZipCode, setOperatorZipCode] = useState('');
  const [operatorPhone, setOperatorPhone] = useState('');

  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Para carregar dados da operadora e tenants

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ROOT')) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Efeito para carregar os dados da operadora e a lista de tenants
  useEffect(() => {
    const fetchOperatorAndTenants = async () => {
      if (!isAuthLoading && user && user.role === 'ROOT' && operatorId) {
        setIsLoadingData(true);
        setFormError('');
        try {
          // Busca a lista de Tenants
          const tenantsRes = await axios.get('/api/admin/tenants', {
            headers: { /* 'Authorization': `Bearer ${user.token}` */ }
          });
          setTenants(tenantsRes.data);

          // Busca os dados da Operadora específica
          const operatorRes = await axios.get(`/api/admin/operators/${operatorId}`, {
            headers: { /* 'Authorization': `Bearer ${user.token}` */ }
          });
          const operatorData: Operator = operatorRes.data;
          setOperatorName(operatorData.name);
          setOperatorCnpj(operatorData.cnpj);
          setOperatorLogo(operatorData.logo);
          setOperatorColor(operatorData.color);
          setSelectedTenantId(operatorData.tenantId);
          setOperatorAddress(operatorData.address || '');
          setOperatorAddressComplement(operatorData.addressComplement || '');
          setOperatorNeighborhood(operatorData.neighborhood || '');
          setOperatorCity(operatorData.city || '');
          setOperatorState(operatorData.state || '');
          setOperatorZipCode(operatorData.zipCode || '');
          setOperatorPhone(operatorData.phone || '');

        } catch (err: any) {
          console.error('Erro ao buscar dados:', err);
          if (axios.isAxiosError(err) && err.response) {
            setFormError(err.response.data.message || 'Falha ao carregar dados da operadora ou tenants.');
          } else {
            setFormError(err.message || 'Erro de rede ao carregar dados.');
          }
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchOperatorAndTenants();
  }, [user, isAuthLoading, operatorId]); // Depende do ID da operadora também

  const handleUpdateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    if (!operatorName || !operatorCnpj || !operatorLogo || !operatorColor || !selectedTenantId) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(`/api/admin/operators/${operatorId}`, {
        name: operatorName,
        cnpj: operatorCnpj,
        logo: operatorLogo,
        color: operatorColor,
        tenantId: selectedTenantId,
        address: operatorAddress,
        addressComplement: operatorAddressComplement,
        neighborhood: operatorNeighborhood,
        city: operatorCity,
        state: operatorState,
        zipCode: operatorZipCode,
        phone: operatorPhone,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${user?.token}`
        },
      });

      setFormSuccess(`Operadora "${response.data.name}" atualizada com sucesso!`);
      // Opcional: redirecionar para a lista após o sucesso
      // router.push('/admin/operators');

    } catch (err: any) {
      console.error('Erro ao atualizar operadora:', err);
      if (axios.isAxiosError(err) && err.response) {
        setFormError(err.response.data.message || 'Ocorreu um erro inesperado ao atualizar a operadora.');
      } else {
        setFormError(err.message || 'Ocorreu um erro inesperado ao atualizar a operadora.');
      }
    } finally {
      setIsSubmitting(false);
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

  if (isLoadingData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Carregando Dados...</CardTitle>
            <CardDescription className="text-center">Buscando informações da operadora e tenants.</CardDescription>
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/operators">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Editar Operadora</h1>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl">Dados da Operadora</CardTitle>
            <CardDescription>Atualize as informações da operadora de saúde.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleUpdateOperator} className="flex flex-col gap-6">
              {formError && (
                <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded-md">
                  {formSuccess}
                </p>
              )}
              {/* Seção de Dados da Operadora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="operatorName">Nome da Operadora</Label>
                  <Input
                    id="operatorName"
                    type="text"
                    placeholder="Ex: Unimed, Bradesco Saúde"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorCnpj">CNPJ</Label>
                  <Input
                    id="operatorCnpj"
                    type="text"
                    placeholder="Ex: 00.000.000/0001-00"
                    required
                    value={operatorCnpj}
                    onChange={(e) => setOperatorCnpj(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorLogo">URL do Logo</Label>
                  <Input
                    id="operatorLogo"
                    type="url"
                    placeholder="Ex: https://exemplo.com/logo.png"
                    required
                    value={operatorLogo}
                    onChange={(e) => setOperatorLogo(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorColor">Cor Principal (Hex)</Label>
                  <Input
                    id="operatorColor"
                    type="text"
                    placeholder="Ex: #007bff"
                    required
                    value={operatorColor}
                    onChange={(e) => setOperatorColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Seção de Endereço da Operadora */}
              <h3 className="text-lg font-semibold mt-4">Endereço da Operadora</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="operatorAddress">Endereço</Label>
                  <Input
                    id="operatorAddress"
                    type="text"
                    placeholder="Ex: Rua Exemplo, 123"
                    value={operatorAddress}
                    onChange={(e) => setOperatorAddress(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorAddressComplement">Complemento</Label>
                  <Input
                    id="operatorAddressComplement"
                    type="text"
                    placeholder="Ex: Apto 101"
                    value={operatorAddressComplement}
                    onChange={(e) => setOperatorAddressComplement(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorNeighborhood">Bairro</Label>
                  <Input
                    id="operatorNeighborhood"
                    type="text"
                    placeholder="Ex: Centro"
                    value={operatorNeighborhood}
                    onChange={(e) => setOperatorNeighborhood(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorCity">Cidade</Label>
                  <Input
                    id="operatorCity"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={operatorCity}
                    onChange={(e) => setOperatorCity(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorState">Estado (UF)</Label>
                  <Input
                    id="operatorState"
                    type="text"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={operatorState}
                    onChange={(e) => setOperatorState(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorZipCode">CEP</Label>
                  <Input
                    id="operatorZipCode"
                    type="text"
                    placeholder="Ex: 00000-000"
                    value={operatorZipCode}
                    onChange={(e) => setOperatorZipCode(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="operatorPhone">Telefone</Label>
                  <Input
                    id="operatorPhone"
                    type="tel"
                    placeholder="Ex: (XX) XXXX-XXXX"
                    value={operatorPhone}
                    onChange={(e) => setOperatorPhone(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Seleção do Tenant */}
              <div className="grid gap-2 mt-4">
                <Label htmlFor="tenantSelect">Associar ao Tenant</Label>
                {isLoadingData ? ( // Usa isLoadingData para o Select também
                  <p className="text-muted-foreground">Carregando Tenants...</p>
                ) : tenants.length === 0 ? (
                  <p className="text-destructive">Nenhum Tenant disponível.</p>
                ) : (
                  <Select value={selectedTenantId} onValueChange={setSelectedTenantId} disabled={isSubmitting}>
                    <SelectTrigger id="tenantSelect">
                      <SelectValue placeholder="Selecione um Tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting || isLoadingData}>
                {isSubmitting ? 'Atualizando Operadora...' : 'Atualizar Operadora'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
