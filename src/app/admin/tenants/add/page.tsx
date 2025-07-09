'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Building, Home, User, CreditCard, CheckCircle2 } from "lucide-react"; // Importe mais ícones

// Função auxiliar para gerar um slug a partir de um nome
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export default function AddTenantPage() {
  // Estados do Formulário
  const [currentStep, setCurrentStep] = useState(1); // Controla a etapa atual

  // Estados do Tenant
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantCnpj, setTenantCnpj] = useState('');
  const [tenantLogoUrl, setTenantLogoUrl] = useState('');
  const [tenantColor, setTenantColor] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantAddressComplement, setTenantAddressComplement] = useState('');
  const [tenantNeighborhood, setTenantNeighborhood] = useState('');
  const [tenantCity, setTenantCity] = useState('');
  const [tenantState, setTenantState] = useState('');
  const [tenantZipCode, setTenantZipCode] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [isPremiumSubscriber, setIsPremiumSubscriber] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Estados do Admin do Tenant
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Efeito para redirecionar se o usuário não for ROOT
  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ROOT')) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Efeito: Preencher o slug automaticamente ao digitar o nome do tenant
  useEffect(() => {
    if (tenantName) {
      setTenantSlug(generateSlug(tenantName));
    } else {
      setTenantSlug('');
    }
  }, [tenantName]);

  // Validação de etapa antes de avançar
  const validateStep = (step: number): boolean => {
    setFormError(''); // Limpa erros anteriores da etapa
    switch (step) {
      case 1: // Dados do Tenant (Operadora)
        if (!tenantName || !tenantSlug || !tenantCnpj || !tenantLogoUrl || !tenantColor) {
          setFormError('Por favor, preencha todos os campos obrigatórios da Etapa 1: Nome, Slug, CNPJ, URL do Logo e Cor Principal.');
          return false;
        }
        break;
      case 2: // Endereço do Tenant (Operadora)
        // Os campos de endereço são opcionais, então não há validação rigorosa aqui.
        // Se desejar torná-los obrigatórios, adicione a lógica aqui.
        break;
      case 3: // Dados do Administrador do Tenant
        if (!adminName || !adminEmail || !adminPassword) {
          setFormError('Por favor, preencha todos os campos obrigatórios da Etapa 3: Nome do Administrador, Email e Senha.');
          return false;
        }
        break;
      case 4: // Assinatura e Status (não há campos obrigatórios específicos aqui)
        break;
      default:
        return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    // Validação final de todos os campos obrigatórios antes de enviar
    if (
      !tenantName || !tenantSlug || !tenantCnpj || !tenantLogoUrl || !tenantColor ||
      !adminName || !adminEmail || !adminPassword
    ) {
      setFormError('Por favor, preencha todos os campos obrigatórios antes de finalizar o cadastro.');
      setIsSubmitting(false);
      return;
    }

    // --- DEBUG: Log dos dados sendo enviados ---
    console.log('Dados do Tenant sendo enviados:', {
      name: tenantName,
      slug: tenantSlug,
      cnpj: tenantCnpj,
      logoUrl: tenantLogoUrl,
      color: tenantColor,
      address: tenantAddress,
      addressComplement: tenantAddressComplement,
      neighborhood: tenantNeighborhood,
      city: tenantCity,
      state: tenantState,
      zipCode: tenantZipCode,
      phone: tenantPhone,
      isPremiumSubscriber,
      isPaused,
      adminName,
      adminEmail,
      adminPassword,
    });
    // --- FIM DEBUG ---

    try {
      const response = await axios.post('/api/admin/tenants/add', {
        name: tenantName,
        slug: tenantSlug,
        cnpj: tenantCnpj,
        logoUrl: tenantLogoUrl,
        color: tenantColor,
        address: tenantAddress,
        addressComplement: tenantAddressComplement,
        neighborhood: tenantNeighborhood,
        city: tenantCity,
        state: tenantState,
        zipCode: tenantZipCode,
        phone: tenantPhone,
        isPremiumSubscriber,
        isPaused,
        adminName,
        adminEmail,
        adminPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${user?.token}`
        },
      });

      setFormSuccess(response.data.message || `Tenant e administrador criados com sucesso!`);
      // Limpar formulário após sucesso
      setTenantName('');
      setTenantSlug('');
      setTenantCnpj('');
      setTenantLogoUrl('');
      setTenantColor('');
      setTenantAddress('');
      setTenantAddressComplement('');
      setTenantNeighborhood('');
      setTenantCity('');
      setTenantState('');
      setTenantZipCode('');
      setTenantPhone('');
      setIsPremiumSubscriber(false);
      setIsPaused(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setCurrentStep(1); // Volta para a primeira etapa

    } catch (err: any) {
      console.error('Erro ao criar tenant:', err);
      if (axios.isAxiosError(err) && err.response) {
        // A API pode retornar mensagens de erro mais específicas, como "Slug já existe"
        setFormError(err.response.data.message || 'Ocorreu um erro inesperado ao criar o tenant.');
      } else {
        setFormError(err.message || 'Ocorreu um erro inesperado ao criar o tenant.');
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

  const steps = [
    { title: 'Dados do Tenant', icon: Building },
    { title: 'Endereço', icon: Home },
    { title: 'Dados do Administrador', icon: User },
    { title: 'Assinatura e Status', icon: CreditCard },
  ];

  return (
    <main className="min-h-screen bg-accent p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/tenants">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Adicionar Novo Tenant (Operadora)</h1>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            {/* Indicador de Progresso */}
            <div className="flex justify-between items-center mb-6">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300
                      ${isActive ? 'bg-primary' : isCompleted ? 'bg-green-500' : 'bg-gray-400'}`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                    </div>
                    <p className={`text-sm mt-2 text-center transition-colors duration-300
                      ${isActive ? 'text-primary font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <CardTitle className="text-xl flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 text-primary" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Preencha os dados básicos do Tenant (Operadora)."}
              {currentStep === 2 && "Informe o endereço completo do Tenant (Operadora)."}
              {currentStep === 3 && "Crie as credenciais para o usuário administrador deste Tenant."}
              {currentStep === 4 && "Defina o status de assinatura e operação do Tenant."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleCreateTenant} className="flex flex-col gap-6">
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

              {/* ETAPA 1: Dados do Tenant (Operadora) */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tenantName">Nome do Tenant (Operadora) <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenantName"
                      type="text"
                      placeholder="Ex: Oplan Saúde, MedPlus"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantSlug">Slug (URL) <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenantSlug"
                      type="text"
                      placeholder="Ex: oplan-saude (usado na URL)"
                      required
                      value={tenantSlug}
                      onChange={(e) => setTenantSlug(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantCnpj">CNPJ <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenantCnpj"
                      type="text"
                      placeholder="Ex: 00.000.000/0001-00"
                      required
                      value={tenantCnpj}
                      onChange={(e) => setTenantCnpj(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantLogoUrl">URL do Logo <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenantLogoUrl"
                      type="url"
                      placeholder="Ex: https://exemplo.com/logo.png"
                      required
                      value={tenantLogoUrl}
                      onChange={(e) => setTenantLogoUrl(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantColor">Cor Principal (Hex) <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenantColor"
                      type="text"
                      placeholder="Ex: #007bff"
                      required
                      value={tenantColor}
                      onChange={(e) => setTenantColor(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 2: Endereço do Tenant (Operadora) */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tenantAddress">Endereço</Label>
                    <Input
                      id="tenantAddress"
                      type="text"
                      placeholder="Ex: Rua Exemplo, 123"
                      value={tenantAddress}
                      onChange={(e) => setTenantAddress(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantAddressComplement">Complemento</Label>
                    <Input
                      id="tenantAddressComplement"
                      type="text"
                      placeholder="Ex: Apto 101"
                      value={tenantAddressComplement}
                      onChange={(e) => setTenantAddressComplement(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantNeighborhood">Bairro</Label>
                    <Input
                      id="tenantNeighborhood"
                      type="text"
                      placeholder="Ex: Centro"
                      value={tenantNeighborhood}
                      onChange={(e) => setTenantNeighborhood(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantCity">Cidade</Label>
                    <Input
                      id="tenantCity"
                      type="text"
                      placeholder="Ex: São Paulo"
                      value={tenantCity}
                      onChange={(e) => setTenantCity(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantState">Estado (UF)</Label>
                    <Input
                      id="tenantState"
                      type="text"
                      placeholder="Ex: SP"
                      maxLength={2}
                      value={tenantState}
                      onChange={(e) => setTenantState(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantZipCode">CEP</Label>
                    <Input
                      id="tenantZipCode"
                      type="text"
                      placeholder="Ex: 00000-000"
                      value={tenantZipCode}
                      onChange={(e) => setTenantZipCode(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantPhone">Telefone</Label>
                    <Input
                      id="tenantPhone"
                      type="tel"
                      placeholder="Ex: (XX) XXXX-XXXX"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 3: Dados do Administrador do Tenant */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="adminName">Nome do Administrador <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="adminEmail">Email do Administrador <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="adminPassword">Senha do Administrador <span className="text-red-500">*</span></Label>
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
              )}

              {/* ETAPA 4: Assinatura e Status */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPremiumSubscriber"
                      checked={isPremiumSubscriber}
                      onCheckedChange={setIsPremiumSubscriber}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="isPremiumSubscriber">Assinante Premium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPaused"
                      checked={isPaused}
                      onCheckedChange={setIsPaused}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="isPaused">Tenant Pausado</Label>
                  </div>
                </div>
              )}

              {/* Botões de Navegação e Submissão */}
              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                  >
                    Anterior
                  </Button>
                )}
                {currentStep < steps.length && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="ml-auto" // Alinha à direita se não houver botão "Anterior"
                  >
                    Próximo
                  </Button>
                )}
                {currentStep === steps.length && (
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Criando Tenant e Admin...' : 'Criar Tenant e Administrador'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
