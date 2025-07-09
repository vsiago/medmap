import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getAuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const { id } = params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        },
        networks: {
          select: { id: true, name: true }
        }
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const { id } = params;
    const {
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
    } = await req.json();

    // 1. Validação de entrada
    if (!name || !cnpj || !logoUrl || !color) {
      return NextResponse.json(
        { message: 'Nome, CNPJ, Logo e Cor são obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Verificar se o CNPJ já existe para outro tenant (excluindo o atual)
    const existingTenantByCnpj = await prisma.tenant.findFirst({
      where: {
        cnpj,
        NOT: { id: id },
      },
    });

    if (existingTenantByCnpj) {
      return NextResponse.json({ message: 'Já existe outro Tenant com este CNPJ.' }, { status: 409 });
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
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        isPremiumSubscriber: true,
        isPaused: true,
        createdAt: true,
      }
    });

    return NextResponse.json(updatedTenant, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota PUT /api/admin/tenants/${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const { id } = params;

    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: 'Tenant não encontrado para exclusão.' }, { status: 404 });
    }

    // Exclusão em cascata: exclui usuários, redes e comparações ANTES de excluir o Tenant
    await prisma.$transaction([
      prisma.user.deleteMany({ where: { tenantId: id } }),
      prisma.network.deleteMany({ where: { tenantId: id } }),
      prisma.comparison.deleteMany({ where: { tenantId: id } }),
      prisma.tenant.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Tenant e dados associados excluídos com sucesso.' }, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota DELETE /api/admin/tenants/${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao excluir tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
