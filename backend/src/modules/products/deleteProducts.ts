import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function deleteProductsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o ID do produto dos parâmetros da rota
  const { id } = request.params as { id: string }

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

  // Soft delete: desativa o produto em vez de excluí-lo para preservar o histórico de pedidos
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })

  // Retorna uma resposta de sucesso
  return reply.status(200).send({
    message: 'Product deleted successfully',
  })
}
