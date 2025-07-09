'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, LayoutDashboard, BellRing, Map, Network, Edit, PlusCircle, Scale,
  Columns, FileText, History, Sparkles, Hospital, Building, MapPin, Plus,
  BarChart2, FilePlus, Lightbulb, Users, UserCog, UserPlus, Settings,
  CreditCard, Tag, LogOut, Menu, Building as BuildingIcon // Importe BuildingIcon para o logo do tenant
} from "lucide-react";
import { cn } from "@/lib/utils"; // Função utilitária do shadcn/ui para concatenar classes
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Para rolagem se muitos itens
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Para sidebar responsiva
import { useAuth } from '@/contexts/AuthContext'; // Importe seu hook de autenticação
import React, { useState } from "react"; // Para controlar o estado do Sheet

// Definição dos itens de navegação
const navItems = [
  {
    category: "Painel Inicial",
    items: [
      { label: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Alertas e Sugestões", icon: BellRing, href: "/alerts" },
      { label: "Mapa Interativo", icon: Map, href: "/mapa" },
    ],
  },
  {
    category: "Minha Rede (Coringa)",
    items: [
      { label: "Visão Geral", icon: Network, href: "/minha-rede" },
      { label: "Editar/Importar", icon: Edit, href: "/minha-rede/editar" },
      { label: "Criar Nova Rede", icon: PlusCircle, href: "/minha-rede/novo" },
      { label: "Comparar Minha Rede", icon: Scale, href: "/minha-rede/comparar" },
    ],
  },
  {
    category: "Comparativos",
    items: [
      { label: "Iniciar Nova Comparação", icon: Columns, href: "/comparar" },
      { label: "Histórico de Comparações", icon: History, href: "/comparativos/historico" },
      { label: "Wizard de Comparação", icon: Sparkles, href: "/comparativos/novo" },
    ],
  },
  {
    category: "Rede de Unidades",
    items: [
      { label: "Lista de Unidades", icon: Hospital, href: "/rede" },
      { label: "Agrupamento por Cidade", icon: Building, href: "/rede/cidades" },
      { label: "Adicionar Unidades", icon: Plus, href: "/rede/adicionar" },
    ],
  },
  {
    category: "Relatórios",
    items: [
      { label: "Lista de Relatórios", icon: BarChart2, href: "/relatorios" },
      { label: "Gerar Relatório Customizado", icon: FilePlus, href: "/relatorios/novo" },
      { label: "Insights Estratégicos", icon: Lightbulb, href: "/relatorios/insights" },
    ],
  },
  {
    category: "Gestão de Usuários",
    items: [
      { label: "Usuários da Operadora", icon: Users, href: "/usuarios" },
      { label: "Convidar Colaborador", icon: UserPlus, href: "/usuarios/adicionar" },
    ],
  },
  {
    category: "Configurações",
    items: [
      { label: "Dados da Operadora", icon: Settings, href: "/configuracoes" },
      { label: "Plano e Billing", icon: CreditCard, href: "/configuracoes/planos" },
      { label: "Gerenciar Tags", icon: Tag, href: "/configuracoes/tags" },
    ],
  },
];

interface TenantSidebarProps {
  tenantOperatorSlug: string; // O slug do tenant da URL
}

export function TenantSidebar({ tenantOperatorSlug }: TenantSidebarProps) {
  const pathname = usePathname();
  const { user, tenantConfig, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar a abertura do Sheet

  // Função para renderizar os links de navegação
  const renderNavLinks = () => (
    <ScrollArea className="h-[calc(100vh-120px)] px-4 py-6"> {/* Altura ajustada para caber logo/user */}
      <div className="space-y-4">
        {navItems.map((category, index) => (
          <div key={index} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground px-2">
              {category.category}
            </h3>
            {category.items.map((item) => {
              // Constrói o href completo com o slug do tenant
              const fullHref = `/${tenantOperatorSlug}${item.href}`;
              const isActive = pathname === fullHref || (pathname.startsWith(fullHref) && fullHref !== `/${tenantOperatorSlug}/dashboard`); // Ajuste para sub-rotas

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start text-left text-muted-foreground hover:bg-accent hover:text-primary",
                    isActive && "bg-accent text-primary font-semibold"
                  )}
                  onClick={() => setIsOpen(false)} // Fecha o Sheet ao clicar em um link
                >
                  <Link href={fullHref} className="flex items-center space-x-3">
                    {React.createElement(item.icon, { className: "h-5 w-5" })}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
            {index < navItems.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <>
      {/* Sidebar para telas maiores (desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card text-card-foreground shadow-lg">
        <div className="p-4 border-b flex flex-col items-center">
          {tenantConfig?.logoUrl ? (
            <img
              src={tenantConfig.logoUrl}
              alt={`${tenantConfig.name} Logo`}
              className="h-16 w-16 object-contain rounded-full mb-2"
              onError={(e) => (e.currentTarget.src = `https://placehold.co/64x64/cccccc/000000?text=Logo`)}
            />
          ) : (
            <BuildingIcon className="h-16 w-16 text-primary mb-2" />
          )}
          <h2 className="text-xl font-bold text-primary-foreground text-center">
            {tenantConfig?.name || 'Seu Tenant'}
          </h2>
          {user && (
            <p className="text-sm text-muted-foreground text-center">
              Olá, {user.name} ({user.role})
            </p>
          )}
        </div>
        {renderNavLinks()}
        <div className="p-4 border-t">
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Sidebar para telas menores (mobile) - usando Sheet */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <div className="p-4 border-b flex flex-col items-center">
              {tenantConfig?.logoUrl ? (
                <img
                  src={tenantConfig.logoUrl}
                  alt={`${tenantConfig.name} Logo`}
                  className="h-16 w-16 object-contain rounded-full mb-2"
                  onError={(e) => (e.currentTarget.src = `https://placehold.co/64x64/cccccc/000000?text=Logo`)}
                />
              ) : (
                <BuildingIcon className="h-16 w-16 text-primary mb-2" />
              )}
              <h2 className="text-xl font-bold text-primary-foreground text-center">
                {tenantConfig?.name || 'Seu Tenant'}
              </h2>
              {user && (
                <p className="text-sm text-muted-foreground text-center">
                  Olá, {user.name} ({user.role})
                </p>
              )}
            </div>
            {renderNavLinks()}
            <div className="p-4 border-t">
              <Button onClick={logout} variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
