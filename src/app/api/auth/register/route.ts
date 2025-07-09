import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Certifique-se de ter 'bcryptjs' instalado: npm install bcryptjs

const prisma = new PrismaClient();

// Rota POST para registro de novos usuários
export async function POST(req: Request) {
  try {
    // Extrai os dados do corpo da requisição: nome, email, senha e tenantId
    const { name, email, password, tenantId } = await req.json();

    // 1. Validação de entrada: verifica se todos os campos obrigatórios foram fornecidos
    if (!name || !email || !password || !tenantId) {
      return NextResponse.json(
        { message: 'Todos os campos (nome, email, senha, ID do Tenant) são obrigatórios.' },
        { status: 400 } // 400 Bad Request
      );
    }

    // 2. Verificar se o email já está em uso para evitar duplicidade
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 }); // 409 Conflict
    }

    // 3. Verificar se o tenantId fornecido realmente existe no banco de dados
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: 'Tenant inválido ou não encontrado.' }, { status: 400 });
    }

    // 4. Hashear a senha antes de salvar no banco de dados para segurança
    const hashedPassword = await bcrypt.hash(password, 10); // '10' é o saltRounds, custo computacional do hash

    // 5. Criar o novo usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tenantId,
        role: 'ANALYST', // Define a role padrão para novos usuários registrados (ex: ANALYST)
      },
      select: { // Seleciona apenas os campos que serão retornados ao frontend (NUNCA inclua a senha hashed)
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      }
    });

    // 6. Buscar informações básicas do tenant para retornar ao frontend, útil para o AuthContext (white-label)
    const tenantConfig = await prisma.tenant.findUnique({
      where: { id: newUser.tenantId },
      select: { id: true, name: true, logoUrl: true, color: true }, // Seleciona apenas os campos de configuração
    });

    // 7. Retornar os dados do novo usuário e a configuração do tenant
    // Em um cenário de produção, você geraria um JWT (JSON Web Token) aqui e o retornaria ao cliente
    // para autenticação de futuras requisições.
    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId,
      tenantConfig: tenantConfig,
      // token: 'seu_jwt_gerado_aqui' // Exemplo de onde o token JWT seria retornado
    }, { status: 201 }); // 201 Created: indica que o recurso foi criado com sucesso

  } catch (error) {
    console.error('Erro na rota de registro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao registrar.' }, { status: 500 });
  } finally {
    // É uma boa prática desconectar o Prisma após cada operação de API em Route Handlers
    await prisma.$disconnect(); 
  }
}
