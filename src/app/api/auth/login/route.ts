import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Certifique-se de ter 'bcryptjs' instalado: npm install bcryptjs

const prisma = new PrismaClient();

// Rota POST para login de usuários
export async function POST(req: Request) {
  try {
    const { email, password, tenantSlug } = await req.json(); // Recebe também o tenantSlug

    // 1. Validar entrada
    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    // 2. Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Usar mensagem genérica para segurança (não informar se o email não existe ou a senha está errada)
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // 3. Comparar a senha fornecida com a senha hash armazenada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // 4. Validação de Tenant para usuários não-ROOT
    let tenantConfig = null;
    if (user.role !== 'ROOT') {
      if (!user.tenantId) {
        // Usuário não-ROOT sem tenantId associado (erro de dados)
        return NextResponse.json({ message: 'Usuário sem associação de Tenant válida.' }, { status: 403 });
      }

      // Buscar o tenant do usuário pelo ID
      const userTenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { id: true, name: true, logoUrl: true, color: true, slug: true },
      });

      if (!userTenant) {
        return NextResponse.json({ message: 'Tenant associado ao usuário não encontrado.' }, { status: 403 });
      }

      // NOVO: Se um tenantSlug foi fornecido na requisição, validar se ele corresponde ao tenant do usuário
      if (tenantSlug && userTenant.slug !== tenantSlug) {
        return NextResponse.json({ message: 'Credenciais inválidas para este Tenant.' }, { status: 403 });
      }

      tenantConfig = userTenant; // Atribui a configuração do tenant
    } else {
      // Se for ROOT, e um tenantSlug foi fornecido, verificar se é um tenant válido
      // Um ROOT pode logar em qualquer tenant, mas se o slug for passado, ele pode estar tentando
      // acessar um tenant específico. Podemos buscar a config desse tenant para o white-label.
      if (tenantSlug) {
         tenantConfig = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          select: { id: true, name: true, logoUrl: true, color: true, slug: true },
        });
        // Se o slug não corresponder a um tenant existente, o ROOT ainda pode logar,
        // mas sem a config específica do tenant para o white-label.
      }
    }

    // 5. Retornar os dados do usuário e, se aplicável, do tenant
    // Em um cenário real, você geraria um JWT (JSON Web Token) aqui
    // e o retornaria para o cliente, que o armazenaria.
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId, // Será null para ROOT se o ROOT não tiver um tenantId associado
      tenantConfig: tenantConfig, // Configuração do tenant para white-label, etc.
      // token: 'seu_jwt_gerado_aqui' // Exemplo de onde o token JWT seria retornado
    }, { status: 200 });

  } catch (error) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Desconecta o Prisma do banco de dados
  }
}
