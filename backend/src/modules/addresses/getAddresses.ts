import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function GetAddressesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Busca todos os endereços associados ao usuário logado
  const addresses = await prisma.address.findMany({
    where: { userId: request.user.sub },
  })

  // Retorna uma resposta de sucesso com os detalhes dos endereços encontrados
  return reply.status(200).send({
    message: 'Addresses retrieved successfully',
    addresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      latitude: address.latitude ? Number(address.latitude) : null,
      longitude: address.longitude ? Number(address.longitude) : null,
      isDefault: address.isDefault,
    })),
  })
}
