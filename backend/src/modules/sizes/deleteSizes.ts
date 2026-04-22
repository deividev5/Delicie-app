import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function deleteSizesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  //  Validação de campos obrigatórios
  const { id } = request.params as { id: string }

  // Verificar se o tamanho existe
  const size = await prisma.size.findUnique({
    where: { id },
  })

  // Se não existir, retornar erro
  if (!size) {
    return reply.status(404).send({
      message: 'Size not found',
    })
  }

  // Verificar se o tamanho tem produtos associados
  const productSizesCount = await prisma.productSize.count({
    where: { sizeId: id },
  })

  // Se tiver produtos associados, retornar erro
  if (productSizesCount > 0) {
    return reply.status(400).send({
      message: 'Size has associated products and cannot be deleted',
    })
  }

  // Deletar o tamanho
  await prisma.size.delete({
    where: { id },
  })

  // Retornar sucesso
  return reply.status(200).send({
    message: 'Size deleted successfully',
  })
}
