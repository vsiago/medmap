import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Importe NextRequest
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função auxiliar para gerar um slug a partir de um nome (se necessário para atualizações de nome)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Rota GET para buscar um Tenant específico por ID
export async function GET(
  request: NextRequest, // Use NextRequest para o primeiro argumento
  { params }: { params: { id: string } } // Tipagem correta para o segundo argumento
) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(request);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const { id } = params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        color: true,
        cnpj: true,
        address: true,
        addressComplement: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        isPremiumSubscriber: true,
        isPaused: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(tenant, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota GET /api/admin/tenants/${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Rota PUT para atualizar um Tenant específico por ID
export async function PUT(
  request: NextRequest, // Use NextRequest para o primeiro argumento
  { params }: { params: { id: string } } // Tipagem correta para o segundo argumento
) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(request);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const { id } = params;
    const {
      name,
      cnpj,
      logoUrl, // Alterado para logoUrl para corresponder ao schema
      color,
      address,
      addressComplement,
      neighborhood,
      city,
      state,
      zipCode,
      phone,
      isPremiumSubscriber,
      isPaused,
    } = await request.json(); // Use request.json()

    // 1. Validação de entrada
    if (!name || !cnpj || !logoUrl || !color) {
      return NextResponse.json(
        { message: 'Nome, CNPJ, URL do Logo e Cor são obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Verificar se o CNPJ já existe para outro tenant (excluindo o atual)
    const existingTenantWithCnpj = await prisma.tenant.findFirst({
      where: {
        cnpj,
        NOT: { id: id }, // Exclui o próprio tenant que está sendo atualizado
      },
    });

    if (existingTenantWithCnpj) {
      return NextResponse.json({ message: 'Já existe outro tenant com este CNPJ.' }, { status: 409 });
    }

    // 3. Atualizar o Tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        name,
        cnpj,
        logoUrl,
        color,
        address,
        addressComplement,
        neighborhood,
        city,
        state,
        zipCode,
        phone,
        isPremiumSubscriber,
        isPaused,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        color: true,
        cnpj: true,
        address: true,
        addressComplement: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        isPremiumSubscriber: true,
        isPaused: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Opcional: Se o nome do tenant mudar, você pode querer atualizar o slug.
    // Isso exigiria uma lógica adicional aqui para gerar um novo slug e verificar unicidade.
    // Cuidado ao mudar o slug, pois ele afeta as URLs de subdomínio.
    // Se o slug for alterado, o frontend precisaria ser notificado ou redirecionado.

    return NextResponse.json(updatedTenant, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota PUT /api/admin/tenants/${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Rota DELETE para excluir um Tenant específico por ID
export async function DELETE(
  request: NextRequest, // Use NextRequest para o primeiro argumento
  { params }: { params: { id: string } } // Tipagem correta para o segundo argumento
) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(request);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const { id } = params;

    // Verificar se o tenant existe antes de tentar excluir
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: 'Tenant não encontrado para exclusão.' }, { status: 404 });
    }

    // ATENÇÃO: Excluir um tenant pode ter efeitos em cascata (usuários, redes, comparações).
    // Você deve implementar a lógica de exclusão em cascata aqui ou no seu schema Prisma
    // (com `onDelete: Cascade` nas relações) para garantir a integridade dos dados.
    // Por exemplo, antes de excluir o tenant, você pode querer excluir todos os usuários
    // e redes associadas a ele.

    // Exemplo de exclusão em cascata manual (se não estiver no Prisma schema):
    // await prisma.user.deleteMany({ where: { tenantId: id } });
    // await prisma.network.deleteMany({ where: { tenantId: id } });
    // await prisma.comparison.deleteMany({ where: { tenantId: id } });

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tenant excluído com sucesso.' }, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota DELETE /api/admin/tenants/${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao excluir tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
