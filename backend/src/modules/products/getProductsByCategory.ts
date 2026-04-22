import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getProductsByCategoryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { categoryId } = request.params as { categoryId: string }

  // Verifica se a categoria existe
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  })

  // Se a categoria não existir, retorna 404
  if (!category) {
    return reply.status(404).send({
      message: 'Category not found',
    })
  }

  // Busca os produtos ativos da categoria
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  // Retorna os produtos encontrados
  return reply.status(200).send({
    message: 'Products retrieved successfully',
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
    })),
  })
}
