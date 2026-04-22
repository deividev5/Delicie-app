import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function patchProductStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o ID do produto dos parâmetros da rota e o novo status do corpo da requisição
  const { id } = request.params as { id: string }
  const { isActive } = request.body as { isActive: boolean }

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

  // Atualiza o status do produto
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: { isActive },
  })

  // Retorna o produto atualizado
  return reply.status(200).send({
    message: `Product ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
    product: {
      id: updatedProduct.id,
      name: updatedProduct.name,
      isActive: updatedProduct.isActive,
    },
  })
}
