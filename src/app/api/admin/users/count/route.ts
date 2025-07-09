import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado

const prisma = new PrismaClient();

// Rota GET para obter a contagem total de usuários
export async function GET(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida. Apenas usuários com a role 'ROOT'
    // ou uma role administrativa equivalente devem ter acesso.
    // Exemplo (com uma função fictícia getAuthUser):
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode ver a contagem de usuários.' }, { status: 403 });
    // }

    const totalUsers = await prisma.user.count(); // Conta todos os usuários

    return NextResponse.json({ count: totalUsers }, { status: 200 });

  } catch (error) {
    console.error('Erro na rota GET /api/admin/users/count:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao obter contagem de usuários.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
