import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function putProductsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o ID do produto dos parâmetros da rota
  const { id } = request.params as { id: string }

  // Extrai os campos a serem atualizados do corpo da requisição
  const data = request.body as {
    categoryId?: string
    name?: string
    description?: string
    basePrice?: number
    imageUrl?: string
  }

  // Rejeita requisições sem nenhum campo para atualizar
  if (Object.values(data).every((v) => v === undefined)) {
    return reply.status(400).send({
      message: 'At least one field must be provided',
    })
  }

  // Verifica se o produto existe
  const product = await prisma.product.findUnique({
    where: { id },
  })

  // Se o produto não existir, retorna 404
  if (!product) {
    return reply.status(404).send({
      message: 'Product not found',
    })
  }

  // Verifica se a nova categoria existe (quando informada)
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    // Se a categoria não existir, retorna 404
    if (!category) {
      return reply.status(404).send({
        message: 'Category not found',
      })
    }
  }

  // Verifica duplicidade de nome (quando informado e diferente do atual)
  if (data.name && data.name !== product.name) {
    const sameProduct = await prisma.product.findFirst({
      where: { name: data.name },
    })

    // Se já existir um produto com o mesmo nome, retorna 400
    if (sameProduct) {
      return reply.status(400).send({
        message: 'Product with the same name already exists',
      })
    }
  }

  //    Atualiza o produto com os campos fornecidos
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      imageUrl: data.imageUrl,
    },
  })

  // Retorna o produto atualizado
  return reply.status(200).send({
    message: 'Product updated successfully',
    product: {
      id: updatedProduct.id,
      categoryId: updatedProduct.categoryId,
      name: updatedProduct.name,
      description: updatedProduct.description,
      basePrice: Number(updatedProduct.basePrice),
      imageUrl: updatedProduct.imageUrl,
      isActive: updatedProduct.isActive,
      updatedAt: updatedProduct.updatedAt,
    },
  })
}
