import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado do token/sessão

const prisma = new PrismaClient();

// Rota POST para criar uma nova Operadora de Saúde
export async function POST(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida. Apenas usuários com a role 'ROOT'
    // ou uma role administrativa equivalente devem ter acesso.
    // Você deve verificar o token JWT/sessão do usuário aqui.
    // Exemplo (com uma função fictícia getAuthUser):
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode criar operadoras.' }, { status: 403 });
    // }

    const { name, cnpj, tenantId } = await req.json();

    // 1. Validação de entrada
    if (!name || !cnpj || !tenantId) {
      return NextResponse.json(
        { message: 'Nome, CNPJ e ID do Tenant são obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Verificar se o CNPJ já existe para evitar duplicidade
    const existingOperator = await prisma.operator.findUnique({
      where: { cnpj },
    });

    if (existingOperator) {
      return NextResponse.json({ message: 'Já existe uma operadora com este CNPJ.' }, { status: 409 }); // 409 Conflict
    }

    // 3. Verificar se o tenantId fornecido existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: 'Tenant inválido ou não encontrado.' }, { status: 400 });
    }

    // 4. Criar a nova Operadora
    const newOperator = await prisma.operator.create({
      data: {
        name,
        cnpj,
        tenantId,
      },
      select: { // Selecione apenas os campos que você quer retornar
        id: true,
        name: true,
        cnpj: true,
        tenant: {
          select: { name: true } // Inclui o nome do Tenant associado
        },
        createdAt: true,
      }
    });

    return NextResponse.json(newOperator, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Erro na rota POST /api/admin/operators:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao criar operadora.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Rota GET para listar todas as Operadoras de Saúde
export async function GET(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota também DEVE ser protegida para usuários administrativos.
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode listar operadoras.' }, { status: 403 });
    // }

    const operators = await prisma.operator.findMany({
      include: {
        tenant: { // Inclui os dados do Tenant associado
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
