'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Building,
  Key,
  LogOut,
  ChevronDown,
  User as UserIcon // Renomeado para evitar conflito com 'user' do useAuth
} from "lucide-react"; // Importe os ícones do Lucide React
import { cn } from "@/lib/utils"; // Função utilitária do shadcn/ui para concatenar classes
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext'; // Importe seu hook de autenticação
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Componentes Shadcn/UI para Avatar

export function AdminNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); // Obtenha o usuário e a função de logout do contexto

  // Verifica se o usuário é ROOT, se não for, não renderiza a navbar ou redireciona
  if (!user || user.role !== 'ROOT') {
    // O redirecionamento já é tratado no layout/páginas, então aqui apenas não renderizamos
    return null; 
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-primary text-primary-foreground shadow-md">
      {/* Logo ou Título do Admin */}
      <Link href="/admin" className="flex items-center space-x-2">
        <Building className="h-6 w-6" />
        <span className="text-xl font-bold">MedMap Admin</span>
      </Link>

      {/* Links de Navegação */}
      <div className="flex items-center space-x-4">
        <NavLink href="/admin" icon={Home} label="Dashboard" pathname={pathname} />
        <NavLink href="/admin/tenants" icon={Building} label="Operadoras" pathname={pathname} />
        <NavLink href="/admin/register-root" icon={Key} label="Cadastrar ROOT" pathname={pathname} />
      </div>

      {/* Menu do Usuário (Dropdown) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              {/* Use uma imagem de avatar real se tiver, senão use as iniciais do nome */}
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)}</AvatarFallback>
            </Avatar>
            <ChevronDown className="ml-2 h-4 w-4 text-primary-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email} ({user.role})
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

// Componente auxiliar para os links de navegação
interface NavLinkProps {
  href: string;
  icon: React.ElementType; // Tipo para o componente de ícone Lucide React
  label: string;
  pathname: string;
}

function NavLink({ href, icon: Icon, label, pathname }: NavLinkProps) {
  const isActive = pathname === href;

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "text-primary-foreground hover:bg-primary-foreground/20",
        isActive && "bg-primary-foreground/30 font-semibold"
      )}
    >
      <Link href={href} className="flex items-center space-x-2">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}
