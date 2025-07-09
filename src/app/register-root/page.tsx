'use client'; // Indica que este é um Client Component

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Importe seu hook de autenticação
import { useRouter } from 'next/navigation'; // Para redirecionamento
import Link from 'next/link';
import axios from 'axios'; // Usaremos axios para a requisição POST

// Importações dos seus componentes Shadcn/UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Defina a super senha em uma variável de ambiente.
// Em produção, use um método mais seguro para gerenciar segredos.
// Ex: NEXT_PUBLIC_ROOT_ACCESS_PASSWORD="sua_super_senha_aqui" no .env.local
// Esta senha será validada tanto no cliente quanto no servidor.
const ROOT_ACCESS_PASSWORD = process.env.NEXT_PUBLIC_ROOT_ACCESS_PASSWORD || 'default_root_password_change_me';

export default function RegisterRootPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Novos estados para a super senha de acesso à página
  const [accessPassword, setAccessPassword] = useState('');
  const [isAccessPasswordValidated, setIsAccessPasswordValidated] = useState(false);
  const [accessPasswordError, setAccessPasswordError] = useState('');

  const { user, isLoading: isAuthLoading } = useAuth(); // Obtém o usuário logado e o estado de carregamento
  const router = useRouter();

  // Efeito para verificar se a super senha já foi validada na sessão atual
  useEffect(() => {
    const validatedInSession = sessionStorage.getItem('rootAccessValidated') === 'true';
    if (validatedInSession) {
      setIsAccessPasswordValidated(true);
    }
  }, []);

  // Função para lidar com a submissão da super senha de acesso à página
  const handleAccessPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccessPasswordError('');
    if (accessPassword === ROOT_ACCESS_PASSWORD) {
      setIsAccessPasswordValidated(true);
      sessionStorage.setItem('rootAccessValidated', 'true'); // Persiste na sessão
    } else {
      setAccessPasswordError('Senha de acesso incorreta.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      // 1. Faz a requisição POST para a API de registro ROOT
      const response = await axios.post('/api/register-root', {
        name,
        email,
        password,
        accessPassword: accessPassword, // Envia a senha de acesso para validação no servidor
      });

      setSuccessMessage(response.data.message || 'Usuário ROOT criado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');

      router.push('/login');

    } catch (err: any) {
      console.error('Erro no registro ROOT:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Ocorreu um erro inesperado ao registrar o usuário ROOT.');
      } else {
        setError(err.message || 'Ocorreu um erro inesperado ao registrar o usuário ROOT.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exibe um estado de carregamento enquanto o AuthContext verifica a sessão
  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Carregando...</CardTitle>
            <CardDescription className="text-center">Verificando permissões.</CardDescription>
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

  // Se a super senha ainda não foi validada, mostra o formulário de super senha
  if (!isAccessPasswordValidated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
            <CardDescription className="text-center">
              Digite a senha de acesso para registrar usuários ROOT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessPasswordSubmit}>
              <div className="flex flex-col gap-4">
                {accessPasswordError && (
                  <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                    {accessPasswordError}
                  </p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="accessPassword">Senha de Acesso</Label>
                  <Input
                    id="accessPassword"
                    type="password"
                    placeholder="********"
                    required
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full mt-2">
                  Acessar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Se a super senha foi validada, mostra o formulário de registro ROOT
  return (
    <main className="min-h-screen flex items-center justify-center bg-accent">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Registrar Novo Usuário ROOT</CardTitle>
          <CardDescription className="text-center">
            Crie uma nova conta de super-administrador para o sistema MedMap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {error && (
                <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded-md">
                  {successMessage}
                </p>
              )}
              {/* Campo para o Nome do Usuário ROOT */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nome do Super-Admin"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {/* Campo para o Email do Usuário ROOT */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="root@medmap.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {/* Campo para a Senha do Usuário ROOT */}
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
                {isSubmitting ? 'Registrando ROOT...' : 'Registrar Usuário ROOT'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground mt-4">
            {/* O link foi atualizado para refletir o novo caminho da página ROOT */}
            <Link href="/admin" className="underline underline-offset-4 hover:text-primary">
              Voltar para o Painel Admin
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
