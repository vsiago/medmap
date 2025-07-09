export interface UserSession {
  id: string;
  email: string;
  name: string; // Adicionado: Campo 'name' para o usuário
  role: 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER' | 'ROOT';
  tenantId?: string; 
  token?: string; 
}

export interface TenantConfig {
  id: string;
  name: string;
  logoUrl?: string;
  color?: string;
}

export interface AuthContextType {
  user: UserSession | null;
  tenantConfig: TenantConfig | null;
  isLoading: boolean;
  login: (userData: UserSession, configData?: TenantConfig) => void;
  logout: () => void;
}