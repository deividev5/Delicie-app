import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getProductByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true },
      },
      sizes: {
        include: {
          size: {
            select: { id: true, name: true, slices: true, sortOrder: true },
          },
        },
        orderBy: { size: { sortOrder: 'asc' } },
      },
    },
  })

  if (!product) {
    return reply.status(404).send({
      message: 'Product not found',
    })
  }

  return reply.status(200).send({
    message: 'Product retrieved successfully',
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      category: product.category,
      sizes: product.sizes.map((ps) => ({
        id: ps.id,
        price: Number(ps.price),
        size: ps.size,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
  })
}
