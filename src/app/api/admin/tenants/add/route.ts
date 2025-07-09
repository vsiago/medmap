import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Para hashear a senha do admin

const prisma = new PrismaClient();

// Rota POST para criar um novo Tenant (Operadora) e um usuário Administrador
export async function POST(req: Request) {
  try {
    // ATENÇÃO: Autenticação e Autorização
    // Esta rota DEVE ser protegida para usuários administrativos (ex: ROOT).
    // const user = await getAuthUser(req);
    // if (!user || user.role !== 'ROOT') {
    //   return NextResponse.json({ message: 'Acesso negado. Apenas ROOT pode criar tenants.' }, { status: 403 });
    // }

    const {
      name, // Nome do Tenant/Operadora
      slug, // Slug fornecido manualmente pelo frontend
      cnpj,
      logoUrl, // Alterado de 'logo' para 'logoUrl' para corresponder ao schema
      color,
      address,
      addressComplement,
      neighborhood,
      city,
      state,
      zipCode,
      phone,
      isPremiumSubscriber, // Novo campo
      isPaused,            // Novo campo
      adminName,
      adminEmail,
      adminPassword
    } = await req.json();

    // 1. Validação de entrada: todos os campos obrigatórios
    if (!name || !slug || !cnpj || !logoUrl || !color || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { message: 'Nome, Slug, CNPJ, URL do Logo, Cor, Nome do Administrador, Email e Senha do Administrador são obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Verificar se o CNPJ já existe para evitar duplicidade (agora no modelo Tenant)
    const existingTenantByCnpj = await prisma.tenant.findUnique({
      where: { cnpj },
    });

    if (existingTenantByCnpj) {
      return NextResponse.json({ message: 'Já existe um Tenant com este CNPJ.' }, { status: 409 });
    }

    // 3. Verificar se o SLUG fornecido já existe (garantindo unicidade)
    const existingTenantBySlug = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenantBySlug) {
      return NextResponse.json({ message: 'Já existe um Tenant com este Slug. Por favor, escolha outro.' }, { status: 409 });
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

    // 6. Criar o novo Tenant e o usuário Administrador em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o Tenant com todos os dados fornecidos, incluindo os campos de "operadora"
      const newTenant = await tx.tenant.create({
        data: {
          name,
          slug,
          cnpj,
          logoUrl, // Usando logoUrl conforme o schema
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

      return { newTenant, newAdminUser };
    });

    return NextResponse.json({
      tenant: result.newTenant, // Retorna o tenant criado
      adminUser: result.newAdminUser,
      message: `Tenant "${result.newTenant.name}" (slug: ${result.newTenant.slug}) e administrador criados com sucesso!`
    }, { status: 201 });

  } catch (error) {
    console.error('Erro na rota POST /api/admin/tenants/add:', error);
    // Em caso de erro na transação, o Prisma reverte as operações.
    // Aqui, capturamos o erro e retornamos uma mensagem genérica ou mais específica se o erro for do Prisma.
    return NextResponse.json({ message: 'Erro interno do servidor ao criar tenant e administrador.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
