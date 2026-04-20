import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getCategoriesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Busca todas as categorias ativas, ordenadas por sortOrder
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: {
      sortOrder: 'asc',
    },
  })

  // Retorna uma resposta de sucesso com os detalhes das categorias encontradas
  return reply.status(200).send({
    message: 'Categories retrieved successfully',
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    })),
  })
}
