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

export default function AddOperatorPage() {
  // Estados da Operadora
  const [operatorName, setOperatorName] = useState('');
  const [operatorCnpj, setOperatorCnpj] = useState('');
  const [operatorLogo, setOperatorLogo] = useState(''); // Novo estado
  const [operatorColor, setOperatorColor] = useState(''); // Novo estado
  const [operatorAddress, setOperatorAddress] = useState(''); // Novo estado
  const [operatorAddressComplement, setOperatorAddressComplement] = useState(''); // Novo estado
  const [operatorNeighborhood, setOperatorNeighborhood] = useState(''); // Novo estado
  const [operatorCity, setOperatorCity] = useState(''); // Novo estado
  const [operatorState, setOperatorState] = useState(''); // Novo estado
  const [operatorZipCode, setOperatorZipCode] = useState(''); // Novo estado
  const [operatorPhone, setOperatorPhone] = useState(''); // Novo estado

  // Estados do Admin do Tenant
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ROOT')) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Carregar lista de Tenants
  useEffect(() => {
    const fetchTenants = async () => {
      if (!isAuthLoading && user && user.role === 'ROOT') {
        setIsLoadingTenants(true);
        try {
          const response = await axios.get('/api/admin/tenants', {
            headers: {
              // 'Authorization': `Bearer ${user.token}`
            }
          });
          setTenants(response.data);
        } catch (err) {
          console.error('Erro ao buscar tenants:', err);
          // Removida a mensagem específica "Nenhum Tenant disponível. Crie um Tenant primeiro."
          // A mensagem de erro agora é mais genérica ou tratada pelo Select
          setFormError('Falha ao carregar a lista de tenants.');
        } finally {
          setIsLoadingTenants(false);
        }
      }
    };
    fetchTenants();
  }, [user, isAuthLoading]);

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    // Validação de todos os campos obrigatórios
    if (
      !operatorName || !operatorCnpj || !operatorLogo || !operatorColor || !selectedTenantId ||
      !adminName || !adminEmail || !adminPassword
    ) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('/api/admin/operators/add', {
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
        adminName,
        adminEmail,
        adminPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${user?.token}`
        },
      });

      setFormSuccess(response.data.message || `Operadora e administrador criados com sucesso!`);
      // Limpar formulário após sucesso
      setOperatorName('');
      setOperatorCnpj('');
      setOperatorLogo('');
      setOperatorColor('');
      setOperatorAddress('');
      setOperatorAddressComplement('');
      setOperatorNeighborhood('');
      setOperatorCity('');
      setOperatorState('');
      setOperatorZipCode('');
      setOperatorPhone('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setSelectedTenantId('');

    } catch (err: any) {
      console.error('Erro ao criar operadora:', err);
      if (axios.isAxiosError(err) && err.response) {
        setFormError(err.response.data.message || 'Ocorreu um erro inesperado ao criar a operadora.');
      } else {
        setFormError(err.message || 'Ocorreu um erro inesperado ao criar a operadora.');
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

  return (
    <main className="min-h-screen bg-accent p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/operators">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary-foreground">Adicionar Nova Operadora</h1>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl">Dados da Operadora</CardTitle>
            <CardDescription>Preencha os dados para adicionar uma nova operadora de saúde.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleCreateOperator} className="flex flex-col gap-6"> {/* Aumentado o gap para melhor espaçamento */}
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

              {/* Seção de Dados do Administrador do Tenant */}
              <h3 className="text-lg font-semibold mt-4">Dados do Administrador do Tenant</h3>
              <p className="text-sm text-muted-foreground">Este usuário será o administrador da conta do Tenant associado a esta operadora.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adminName">Nome do Administrador</Label>
                  <Input
                    id="adminName"
                    type="text"
                    placeholder="Nome completo do admin"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminEmail">Email do Administrador</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@tenant.com"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminPassword">Senha do Administrador</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="********"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Seleção do Tenant */}
              <div className="grid gap-2 mt-4">
                <Label htmlFor="tenantSelect">Associar ao Tenant</Label>
                {isLoadingTenants ? (
                  <p className="text-muted-foreground">Carregando Tenants...</p>
                ) : tenants.length === 0 ? (
                  // Mensagem mais genérica ou ausente, dependendo da UX desejada
                  <p className="text-destructive">Nenhum Tenant disponível. Por favor, crie um Tenant primeiro.</p>
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

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting || isLoadingTenants || tenants.length === 0}>
                {isSubmitting ? 'Criando Operadora e Admin...' : 'Criar Operadora e Administrador'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
