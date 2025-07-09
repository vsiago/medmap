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
      setIsLoading(true);
      try {
        // Simula a leitura de dados de sessão de um armazenamento local (ex: localStorage)
        // Em produção, use cookies HTTP-only para tokens JWT para maior segurança
        const storedUser = localStorage.getItem('user');
        const storedTenantConfig = localStorage.getItem('tenantConfig');

        if (storedUser) {
          const parsedUser: UserSession = JSON.parse(storedUser);
          setUser(parsedUser);

          // Se o usuário tem tenantId e a configuração do tenant não está no storage, busca
          if (parsedUser.tenantId && !storedTenantConfig) {
            try {
              // Você precisaria de um endpoint como /api/tenants/[tenantId] para buscar a config do tenant
              const res = await fetch(`/api/tenants/${parsedUser.tenantId}`);
              if (res.ok) {
                const configData: TenantConfig = await res.json();
                setTenantConfig(configData);
                localStorage.setItem('tenantConfig', JSON.stringify(configData));
              }
            } catch (fetchError) {
              console.error('Erro ao buscar configuração do tenant:', fetchError);
            }
          } else if (storedTenantConfig) {
            setTenantConfig(JSON.parse(storedTenantConfig));
          }
        }
      } catch (e) {
        console.error('Erro ao carregar sessão:', e);
        // Limpar qualquer dado inválido no storage
        localStorage.removeItem('user');
        localStorage.removeItem('tenantConfig');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []); // Executa apenas uma vez na montagem do componente

  // Função para realizar o login e persistir a sessão
  const login = (userData: UserSession, configData?: TenantConfig) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Persiste os dados do usuário

    if (configData) {
      setTenantConfig(configData);
      localStorage.setItem('tenantConfig', JSON.stringify(configData)); // Persiste a config do tenant
    } else if (userData.role !== 'ROOT') {
      // Se não é ROOT e não veio configData, pode-se tentar buscar a config do tenant aqui
      // (requer um endpoint de API para isso)
    }

    // Redireciona o usuário com base na sua role
    if (userData.role === 'ROOT') {
      router.push('/admin'); // Redireciona para o painel de super-admin
    } else {
      router.push(`/dashboard/${userData.tenantId}`); // Redireciona para o dashboard do tenant
    }
  };

  // Função para realizar o logout e limpar a sessão
  const logout = () => {
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
