import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Certifique-se de ter 'bcryptjs' instalado

const prisma = new PrismaClient();

// Rota POST para registro de novos usuários ROOT
export async function POST(req: Request) {
  try {
    // ATENÇÃO: Em um ambiente de produção, este endpoint DEVE ser fortemente protegido.
    // Considere as seguintes estratégias:
    // 1. Acesso restrito a IPs específicos (firewall).
    // 2. Uso de uma chave de API secreta pré-compartilhada no cabeçalho da requisição.
    // 3. Permitir a criação de ROOTs apenas por um ROOT já autenticado.
    //    (Se for o primeiro ROOT, pode ser um script de inicialização ou uma chave de setup única).
    //    Por exemplo:
    //    const authHeader = req.headers.get('Authorization');
    //    if (!authHeader || authHeader !== `Bearer ${process.env.ROOT_API_SECRET_KEY}`) {
    //      return NextResponse.json({ message: 'Acesso não autorizado para criar ROOT.' }, { status: 401 });
    //    }


    const { name, email, password } = await req.json();

    // 1. Validação de entrada
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Nome, email e senha são obrigatórios.' },
        { status: 400 } // 400 Bad Request
      );
    }

    // 2. Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 }); // 409 Conflict
    }

    // 3. Hashear a senha
    const hashedPassword = await bcrypt.hash(password, 10); // '10' é o saltRounds

    // 4. Criar o novo usuário com a role ROOT
    const newRootUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ROOT', // Define explicitamente a role como ROOT
        // Usuários ROOT não precisam de um tenantId associado diretamente,
        // pois eles operam acima da camada de tenants.
        // Se seu modelo exigir um tenantId, você pode criar um tenant 'admin' ou 'root'
        // e associar todos os ROOTs a ele. Por enquanto, assumimos que pode ser nulo.
        tenantId: null, // Ou um ID de tenant específico para ROOTs, se aplicável
      },
      select: { // Seleciona apenas os campos que serão retornados
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    // 5. Retornar os dados do novo usuário ROOT
    return NextResponse.json({
      id: newRootUser.id,
      email: newRootUser.email,
      name: newRootUser.name,
      role: newRootUser.role,
      message: 'Usuário ROOT criado com sucesso!'
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Erro na rota de registro ROOT:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao registrar ROOT.' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); 
  }
}
