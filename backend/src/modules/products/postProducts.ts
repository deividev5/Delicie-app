import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function postProductsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = request.body as {
    categoryId: string
    name: string
    description?: string
    basePrice: number
    imageUrl?: string
    isActive: boolean
  }

  // Verifica se a categoria existe
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  })

  if (!category) {
    return reply.status(404).send({
      message: 'Category not found',
    })
  }

  // Verifica se já existe um produto com o mesmo nome
  const sameProduct = await prisma.product.findFirst({
    where: { name: data.name },
  })

  if (sameProduct) {
    return reply.status(400).send({
      message: 'Product with the same name already exists',
    })
  }

  const product = await prisma.product.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
    },
  })

  return reply.status(201).send({
    message: 'Product created successfully',
    product: {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
    },
  })
}
