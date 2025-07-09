import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado

const prisma = new PrismaClient();

// Rota GET para listar todos os Tenants
export async function GET(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT, ou quem pode gerenciar operadoras).
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') { // Ou outra role que tenha permissão para ver tenants
    //   return NextResponse.json({ message: 'Acesso negado. Você não tem permissão para listar tenants.' }, { status: 403 });
    // }

    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        // Inclua outros campos que você precise no frontend, como logoUrl, color, etc.
        logoUrl: true,
        color: true,
      },
      orderBy: {
        name: 'asc', // Ordena por nome para facilitar a visualização no Select
      },
    });

    return NextResponse.json(tenants, { status: 200 });

  } catch (error) {
    console.error('Erro na rota GET /api/admin/tenants:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao listar tenants.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Se você tiver outras operações de CRUD para Tenants (POST, PUT, DELETE),
// elas podem ser adicionadas aqui ou em sub-rotas como /api/admin/tenants/add, /api/admin/tenants/[id]
