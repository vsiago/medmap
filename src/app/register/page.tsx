'use client'; // Indica que este é um Client Component

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Importe seu hook de autenticação
import Link from 'next/link'; // Para o link "Já tem uma conta?"

// Importações dos seus componentes Shadcn/UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction, // Assumindo que é um componente customizado como no LoginPage
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from 'next/navigation'; // Para ler parâmetros da URL

export default function RegisterPage() {
  const [name, setName] = useState(''); // Novo campo para o nome do usuário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // Novo estado para sucesso

  const { login, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const tenantIdFromUrl = searchParams.get('tenantId'); // Tenta obter o tenantId da URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa qualquer erro anterior
    setRegistrationSuccess(false); // Limpa o status de sucesso
    setIsSubmitting(true); // Ativa o estado de envio

    // Validação básica do lado do cliente
    if (!tenantIdFromUrl) {
      setError('ID do Tenant é necessário para o registro. Por favor, acesse o link de registro correto.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Faz a requisição POST para sua API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, tenantId: tenantIdFromUrl }),
      });

      // 2. Verifica se a resposta da API foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no registro. Tente novamente.');
      }

      // 3. Se o registro for bem-sucedido, obtém os dados do novo usuário e do tenant
      const userData = await response.json();
      
      // 4. Se o registro foi um sucesso, você pode exibir uma mensagem e
      //    automaticamente logar o usuário ou redirecioná-lo para a página de login.
      setRegistrationSuccess(true);
      // Opcional: Se quiser logar automaticamente após o registro:
      login(userData, userData.tenantConfig); // O `login` do contexto já faz o redirecionamento
      // Ou, se não logar automaticamente:
      // setTimeout(() => router.push('/login'), 2000); // Redireciona para login após 2 segundos
      
    } catch (err: any) {
      // 5. Trata erros: exibe a mensagem de erro
      console.error('Erro no registro:', err);
      setError(err.message || 'Ocorreu um erro inesperado ao registrar. Tente novamente.');
    } finally {
      setIsSubmitting(false); // Desativa o estado de envio
    }
  };

  // Se o contexto ainda estiver carregando a sessão inicial
  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>Preparando a página de registro.</CardDescription>
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

  // Se o registro foi um sucesso, exibe uma mensagem de sucesso
  if (registrationSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Registro Concluído!</CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso. Você será redirecionado em breve.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <p>Se não for redirecionado automaticamente, clique aqui para <Link href="/login" className="underline text-primary">fazer login</Link>.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-accent">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Criar uma Nova Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha seus dados para criar sua conta no MedMap.
            {tenantIdFromUrl && (
              <p className="mt-2 text-primary-foreground">Registrando para o Tenant: <strong>{tenantIdFromUrl}</strong></p>
            )}
            {!tenantIdFromUrl && (
              <p className="mt-2 text-destructive">Atenção: Nenhum ID de Tenant foi fornecido na URL. O registro pode não funcionar corretamente.</p>
            )}
          </CardDescription>
          {/* Você pode adicionar um CardAction aqui se precisar */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {error && (
                <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                  {error}
                </p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu Nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {/* Se você tiver outras opções de registro, como Google */}
          {/* <Button variant="outline" className="w-full">
            Registrar com Google
          </Button> */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}