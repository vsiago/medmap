import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado

const prisma = new PrismaClient();

// Rota GET para listar todas as Operadoras de Saúde
export async function GET(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode listar operadoras.' }, { status: 403 });
    // }

    const operators = await prisma.operator.findMany({
      include: {
        tenant: { // Inclui os dados do Tenant associado para exibição
          select: { id: true, name: true }
        }
      },
      orderBy: {
        createdAt: 'desc', // Ordena pelas mais recentes
      },
    });

    return NextResponse.json(operators, { status: 200 });

  } catch (error) {
    console.error('Erro na rota GET /api/admin/operators:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao listar operadoras.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// O método POST foi removido daqui e será movido para /api/admin/operators/add/route.ts
