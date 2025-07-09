'use client'; // Indica que este é um Client Component

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Importe seu hook de autenticação
import Link from 'next/link'; // Para o link "Sign Up" ou "Forgot your password?"

// Importações dos seus componentes Shadcn/UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction, // Note: CardAction is not a standard Shadcn Card component. Assuming it's custom.
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar o envio do formulário

  // Use o hook useAuth para acessar a função de login do contexto
  // `isAuthLoading` é o estado do contexto que indica se a sessão inicial está carregando.
  const { login, isLoading: isAuthLoading } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa qualquer erro anterior
    setIsSubmitting(true); // Ativa o estado de envio

    try {
      // 1. Faz a requisição POST para sua API de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 2. Verifica se a resposta da API foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json();
        // Lança um erro com a mensagem da API ou uma mensagem padrão
        throw new Error(errorData.message || 'Falha na autenticação. Verifique suas credenciais.');
      }

      // 3. Se o login for bem-sucedido, obtém os dados do usuário e do tenant
      const userData = await response.json();
      
      // 4. Chama a função `login` do seu contexto
      // Esta função se encarrega de:
      // - Salvar os dados do usuário e tenant no estado do contexto
      // - Persistir esses dados (ex: no localStorage/cookies)
      // - Redirecionar o usuário para a rota apropriada (/admin ou /dashboard/[tenantId])
      login(userData, userData.tenantConfig); // Passa userData e tenantConfig para o contexto

    } catch (err: any) {
      // 5. Trata erros: exibe a mensagem de erro
      console.error('Erro no login:', err);
      setError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false); // Desativa o estado de envio, mesmo em caso de erro
    }
  };

  // Se o contexto ainda estiver carregando a sessão inicial, pode mostrar um loading
  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>Verificando sua sessão.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            {/* Você pode adicionar um spinner ou animação Shadcn/UI aqui */}
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
    <main className="min-h-screen flex items-center justify-center bg-accent">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Entrar na sua conta</CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail e senha para acessar sua conta MedMap.
          </CardDescription>
          {/* Se CardAction é um componente customizado para botões na header */}
          {/* <CardAction>
            <Button variant="link" asChild>
              <Link href="/register">Cadastre-se</Link>
            </Button>
          </CardAction> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4"> {/* Reduzindo o gap de 6 para 4 para um visual mais compacto */}
              {error && (
                <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                  {error}
                </p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting} // Desabilita o input enquanto está enviando
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  {/* Você pode adicionar o link "Esqueceu a senha?" aqui se tiver a rota */}
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting} // Desabilita o input enquanto está enviando
                />
              </div>
              {/* O botão de submit agora está dentro da CardContent para fazer parte do formulário */}
              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {/* Você pode manter o botão de "Login com Google" aqui, se aplicável */}
          <Button variant="outline" className="w-full">
            Login com Google
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Não tem uma conta?{' '}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}