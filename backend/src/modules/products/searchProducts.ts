import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function searchProductsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Busca produtos ativos cujo nome contenha a string de consulta (case-insensitive)
  const { q } = request.query as { q: string }

  // Valida a presença do parâmetro de consulta
  if (!q || q.trim() === '') {
    return reply.status(400).send({
      message: 'Query parameter "q" is required',
    })
  }

  // Realiza a busca no banco de dados usando o Prisma
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      name: {
        contains: q,
        mode: 'insensitive',
      },
    },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Retorna os resultados da busca
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
