import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { RouteHandlerContext } from 'next/dist/server/future/route-modules/app-route/module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// GET: Buscar um tenant específico por ID
export async function GET(
  request: NextRequest,
  context: RouteHandlerContext
) {
  try {
    const { id } = context.params;

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
      },
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(tenant, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota GET /api/admin/tenants/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Atualizar um tenant específico por ID
export async function PUT(
  request: NextRequest,
  context: RouteHandlerContext
) {
  try {
    const { id } = context.params;

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
    } = await request.json();

    if (!name || !cnpj || !logoUrl || !color) {
      return NextResponse.json(
        { message: 'Nome, CNPJ, URL do Logo e Cor são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingTenantWithCnpj = await prisma.tenant.findFirst({
      where: {
        cnpj,
        NOT: { id: id },
      },
    });

    if (existingTenantWithCnpj) {
      return NextResponse.json({ message: 'Já existe outro tenant com este CNPJ.' }, { status: 409 });
    }

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
      },
    });

    return NextResponse.json(updatedTenant, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota PUT /api/admin/tenants/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Excluir um tenant específico por ID
export async function DELETE(
  request: NextRequest,
  context: RouteHandlerContext
) {
  try {
    const { id } = context.params;

    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: 'Tenant não encontrado para exclusão.' }, { status: 404 });
    }

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tenant excluído com sucesso.' }, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota DELETE /api/admin/tenants/${context.params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao excluir tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
