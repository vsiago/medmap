import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Certifique-se de ter 'bcryptjs' instalado: npm install bcryptjs

const prisma = new PrismaClient();

// Rota POST para login de usuários
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

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

    // 4. Se a senha for válida, buscar informações do tenant (se o usuário não for ROOT)
    let tenantConfig = null;
    if (user.role !== 'ROOT' && user.tenantId) {
      tenantConfig = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { id: true, name: true, logoUrl: true, color: true }, // Selecione apenas os campos necessários
      });
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
