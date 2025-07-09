import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Rota GET para buscar a configuração de um Tenant específico por ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Busca o tenant pelo ID e seleciona apenas os campos necessários para a configuração
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        color: true,
        slug: true, // Inclua o slug, pois é usado para white-label
      }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(tenant, { status: 200 });

  } catch (error) {
    console.error(`Erro na rota GET /api/tenants/${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar configuração do tenant.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
