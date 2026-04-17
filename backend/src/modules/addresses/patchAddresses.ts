import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function patchAddressesController(
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

  // Usa transaction para garantir consistência
  await prisma.$transaction([
    // Desmarca todos os endereços do usuário como padrão
    prisma.address.updateMany({
      where: { userId: request.user.sub },
      data: { isDefault: false },
    }),
    // Marca o endereço selecionado como padrão
    prisma.address.update({
      where: { id },
      data: { isDefault: true },
    }),
  ])

  // Retorna uma resposta de sucesso
  return reply.status(200).send({
    message: 'Address updated successfully',
  })
}
