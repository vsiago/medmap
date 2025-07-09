import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Para hashear a senha do admin
// import { getAuthUser } from '@/lib/auth'; // Exemplo: função para obter o usuário autenticado

const prisma = new PrismaClient();

// Rota POST para criar uma nova Operadora de Saúde, seu Tenant e um usuário Admin
export async function POST(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode criar operadoras.' }, { status: 403 });
    // }

    const {
      name, // Nome da Operadora (será usado para o Tenant também)
      cnpj,
      logo,
      color,
      address,
      addressComplement,
      neighborhood,
      city,
      state,
      zipCode,
      phone,
      adminName,
      adminEmail,
      adminPassword
    } = await req.json();

    // 1. Validação de entrada
    if (!name || !cnpj || !logo || !color || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { message: 'Nome, CNPJ, Logo, Cor da Operadora e dados do Administrador (Nome, Email, Senha) são obrigatórios.' },
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

    // 3. Verificar se o email do admin já está em uso
    const existingAdminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdminUser) {
      return NextResponse.json({ message: 'Email do administrador já está em uso.' }, { status: 409 });
    }

    // 4. Hashear a senha do admin
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    // 5. Criar o novo Tenant, a Operadora e o usuário Administrador em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o Tenant primeiro
      const newTenant = await tx.tenant.create({
        data: {
          name: name, // Usar o nome da operadora como nome do tenant
          // Opcional: Você pode adicionar logoUrl e color aqui se o Tenant também tiver esses campos
          // logoUrl: logo,
          // color: color,
        },
      });

      // Criar a Operadora, associando-a ao novo Tenant
      const newOperator = await tx.operator.create({
        data: {
          name,
          cnpj,
          logo,
          color,
          tenantId: newTenant.id, // Usa o ID do Tenant recém-criado
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
          tenant: { select: { id: true, name: true } }, // Seleciona o ID e nome do tenant
          createdAt: true,
        }
      });

      // Criar o usuário Administrador, associando-o ao novo Tenant
      const newAdminUser = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedAdminPassword,
          role: 'ADMIN', // Define a role como ADMIN para o usuário do Tenant
          tenantId: newTenant.id, // Associa ao Tenant recém-criado
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tenantId: true,
        }
      });

      return { newOperator, newAdminUser, newTenant };
    });

    return NextResponse.json({
      operator: result.newOperator,
      adminUser: result.newAdminUser,
      tenant: result.newTenant,
      message: `Operadora "${result.newOperator.name}", Tenant "${result.newTenant.name}" e administrador criados com sucesso!`
    }, { status: 201 });

  } catch (error) {
    console.error('Erro na rota POST /api/admin/operators/add:', error);
    // Em caso de erro na transação, o Prisma reverte as operações.
    // Aqui, capturamos o erro e retornamos uma mensagem genérica ou mais específica se o erro for do Prisma.
    return NextResponse.json({ message: 'Erro interno do servidor ao criar operadora, tenant e administrador.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
