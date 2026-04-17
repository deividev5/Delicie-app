import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function deleteAddressesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o ID do endereço dos parâmetros da requisição
  const { id } = request.params as { id: string }

  // Verifica se o endereço existe e pertence ao usuário logado
  const address = await prisma.address.findFirst({
    where: { id, userId: request.user.sub },
  })

  if (!address) {
    return reply.status(404).send({
      message: 'Address not found',
    })
  }

  // Exclui o endereço
  await prisma.address.delete({
    where: { id },
  })

  // Se o endereço deletado era o padrão, promove outro endereço como padrão
  if (address.isDefault) {
    const nextAddress = await prisma.address.findFirst({
      where: { userId: request.user.sub },
      orderBy: { createdAt: 'asc' },
    })

    if (nextAddress) {
      await prisma.address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      })
    }
  }

  // Retorna uma resposta de sucesso
  return reply.status(200).send({
    message: 'Address deleted successfully',
  })
}
