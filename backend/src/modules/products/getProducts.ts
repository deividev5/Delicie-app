import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getProductsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Retorna apenas produtos ativos com informações da categoria
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

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
      category: product.category,
      createdAt: product.createdAt,
    })),
  })
}
