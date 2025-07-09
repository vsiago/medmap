'use client'; // Indica que este é um Client Component

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, TenantConfig, AuthContextType } from '@/types/auth'; // Ajuste o caminho se necessário
import { useRouter } from 'next/navigation';

// Crie o contexto com um valor padrão (pode ser undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crie o Provider do contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Indica se estamos carregando os dados iniciais da sessão
  const router = useRouter();

  // Efeito para carregar a sessão do usuário ao iniciar a aplicação
  // Em uma aplicação real, isso envolveria verificar um token/cookie de sessão seguro
  useEffect(() => {
    const loadSession = async () => {
      console.log('AuthContext: loadSession iniciado.'); // Log 1
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        const storedTenantConfig = localStorage.getItem('tenantConfig');

        if (storedUser) {
          console.log('AuthContext: Usuário encontrado no localStorage.'); // Log 2
          try { // NOVO: Try-catch para o JSON.parse
            const parsedUser: UserSession = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('AuthContext: Usuário parseado:', parsedUser); // Log 3

            // Se o usuário tem tenantId e a configuração do tenant não está no storage, busca
            if (parsedUser.tenantId && !storedTenantConfig) {
              console.log('AuthContext: Buscando configuração do tenant para ID:', parsedUser.tenantId); // Log 4
              try {
                // Você precisaria de um endpoint como /api/tenants/[tenantId] para buscar a config do tenant
                const res = await fetch(`/api/tenants/${parsedUser.tenantId}`);
                if (res.ok) {
                  const configData: TenantConfig = await res.json();
                  setTenantConfig(configData);
                  localStorage.setItem('tenantConfig', JSON.stringify(configData));
                  console.log('AuthContext: Configuração do tenant carregada e salva:', configData); // Log 5 (sucesso fetch)
                } else {
                  console.error('AuthContext: Falha ao carregar configuração do tenant (status):', res.status, res.statusText); // Log 5 (falha fetch)
                  // Opcional: Limpar tenantConfig se a busca falhar para evitar dados desatualizados
                  localStorage.removeItem('tenantConfig');
                  setTenantConfig(null);
                }
              } catch (fetchError) {
                console.error('AuthContext: Erro ao buscar configuração do tenant (exceção):', fetchError); // Log 5 (exceção fetch)
                // Opcional: Limpar tenantConfig se a busca falhar para evitar dados desatualizados
                localStorage.removeItem('tenantConfig');
                setTenantConfig(null);
              }
            } else if (storedTenantConfig) {
              setTenantConfig(JSON.parse(storedTenantConfig));
              console.log('AuthContext: Configuração do tenant encontrada no localStorage.'); // Log 6
            } else {
              console.log('AuthContext: Usuário tem tenantId, mas sem storedTenantConfig e sem necessidade de buscar.'); // Log 7 (edge case)
            }
          } catch (parseError) {
            console.error('AuthContext: Erro ao parsear storedUser do localStorage:', parseError);
            // Se houver erro de parsing, limpa os dados corrompidos
            localStorage.removeItem('user');
            localStorage.removeItem('tenantConfig');
            setUser(null); // Garante que o usuário seja nulo se o parsing falhar
          }
        } else {
          console.log('AuthContext: Nenhum usuário encontrado no localStorage.'); // Log 8
        }
      } catch (e) {
        console.error('AuthContext: Erro fatal ao carregar sessão:', e); // Log 9 (erro crítico)
        // Limpar qualquer dado inválido no storage
        localStorage.removeItem('user');
        localStorage.removeItem('tenantConfig');
      } finally {
        setIsLoading(false);
        console.log('AuthContext: loadSession finalizado. isLoading setado para false.'); // Log 10
      }
    };

    loadSession();
  }, []); // Executa apenas uma vez na montagem do componente

  // Função para realizar o login e persistir a sessão
  const login = (userData: UserSession, configData?: TenantConfig) => {
    console.log('AuthContext: Função login chamada com userData:', userData, 'e configData:', configData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Persiste os dados do usuário

    if (configData) {
      setTenantConfig(configData);
      localStorage.setItem('tenantConfig', JSON.stringify(configData)); // Persiste a config do tenant
    } else if (userData.role !== 'ROOT') {
      // Se não é ROOT e não veio configData, pode-se tentar buscar a config do tenant aqui
      // (requer um endpoint de API para isso)
      // Nota: Esta lógica já está no useEffect de loadSession, então pode não ser necessária aqui.
      console.warn('AuthContext: Usuário não-ROOT logado sem configData. Pode ser necessário buscar a config do tenant.');
    }

    // Redireciona o usuário com base na sua role
    if (userData.role === 'ROOT') {
      router.push('/admin'); // Redireciona para o painel de super-admin
    } else if (userData.tenantId) { // Garante que há um tenantId para redirecionar
      router.push(`/${userData.tenantId}/dashboard`); // Redireciona para o dashboard do tenant
    } else {
      console.warn('AuthContext: Usuário logado sem tenantId para redirecionamento específico. Redirecionando para /login.');
      router.push('/login'); // Fallback para login global
    }
  };

  // Função para realizar o logout e limpar a sessão
  const logout = () => {
    console.log('AuthContext: Função logout chamada.');
    setUser(null);
    setTenantConfig(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tenantConfig');
    router.push('/login'); // Redireciona para a página de login
  };

  // Valor que será disponibilizado para os componentes consumidores do contexto
  const value: AuthContextType = {
    user,
    tenantConfig,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para consumir o contexto de forma segura
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
