import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado

const prisma = new PrismaClient();

// Rota GET para listar todos os Tenants
export async function GET(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode listar tenants.' }, { status: 403 });
    // }

    const tenants = await prisma.tenant.findMany({
      orderBy: {
        createdAt: 'desc', // Ordena pelos mais recentes
      },
      // Inclua os campos que você precisa exibir no dashboard
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
      }
    });

    return NextResponse.json(tenants, { status: 200 });

  } catch (error) {
    console.error('Erro na rota GET /api/admin/tenants:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao listar tenants.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
