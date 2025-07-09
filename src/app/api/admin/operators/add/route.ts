import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Para hashear a senha do admin
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado

const prisma = new PrismaClient();

// Rota POST para criar uma nova Operadora de Saúde e um usuário Admin para o Tenant
export async function POST(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode criar operadoras.' }, { status: 403 });
    // }

    const {
      name,
      cnpj,
      logo,      // Novo campo
      color,     // Novo campo
      tenantId,
      address,   // Novo campo
      addressComplement, // Novo campo
      neighborhood,    // Novo campo
      city,            // Novo campo
      state,           // Novo campo
      zipCode,         // Novo campo
      phone,           // Novo campo
      adminName,       // Dados do admin do Tenant
      adminEmail,      // Dados do admin do Tenant
      adminPassword    // Dados do admin do Tenant
    } = await req.json();

    // 1. Validação de entrada
    if (!name || !cnpj || !logo || !color || !tenantId || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { message: 'Todos os campos obrigatórios (Operadora e Admin) devem ser preenchidos.' },
        { status: 400 }
      );
    }

    // 2. Verificar se o CNPJ da operadora já existe
    const existingOperator = await prisma.operator.findUnique({
      where: { cnpj },
    });

    if (existingOperator) {
      return NextResponse.json({ message: 'Já existe uma operadora com este CNPJ.' }, { status: 409 });
    }

    // 3. Verificar se o Tenant existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: 'Tenant inválido ou não encontrado.' }, { status: 400 });
    }

    // 4. Verificar se o email do admin já está em uso
    const existingAdminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdminUser) {
      return NextResponse.json({ message: 'Email do administrador já está em uso.' }, { status: 409 });
    }

    // 5. Hashear a senha do admin
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    // 6. Criar a nova Operadora e o usuário Administrador do Tenant em uma transação
    // Isso garante que ambos sejam criados com sucesso ou nenhum seja.
    const [newOperator, newAdminUser] = await prisma.$transaction([
      prisma.operator.create({
        data: {
          name,
          cnpj,
          logo,
          color,
          tenantId,
          address,
          addressComplement,
          neighborhood,
          city,
          state,
          zipCode,
          phone,
        },
        select: {
          id: true,
          name: true,
          cnpj: true,
          logo: true,
          color: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          tenant: { select: { name: true } },
          createdAt: true,
        }
      }),
      prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedAdminPassword,
          role: 'ADMIN', // Define a role como ADMIN para o usuário do Tenant
          tenantId: tenantId, // Associa ao Tenant selecionado
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tenantId: true,
        }
      })
    ]);

    return NextResponse.json({
      operator: newOperator,
      adminUser: newAdminUser,
      message: `Operadora "${newOperator.name}" e administrador do Tenant criados com sucesso!`
    }, { status: 201 });

  } catch (error) {
    console.error('Erro na rota POST /api/admin/operators/add:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao criar operadora e administrador.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
