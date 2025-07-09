import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return Response.json({ message: 'Tenant não encontrado.' }, { status: 404 });
    }

    return Response.json(tenant, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar tenant ${params.id}:`, error);
    return Response.json({ message: 'Erro interno.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const updated = await prisma.tenant.update({
      where: { id },
      data,
    });

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error(`Erro ao atualizar tenant ${params.id}:`, error);
    return Response.json({ message: 'Erro interno.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.tenant.delete({
      where: { id },
    });

    return Response.json({ message: 'Excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao excluir tenant ${params.id}:`, error);
    return Response.json({ message: 'Erro interno.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
