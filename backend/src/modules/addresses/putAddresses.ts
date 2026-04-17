import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function PutAddressesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai os dados do corpo da requisição e os tipa usando TypeScript
  const data = request.body as {
    label?: string
    street?: string
    city?: string
    state?: string
    zipCode?: string
    number?: string
    complement?: string | null
    neighborhood?: string
    latitude?: number | null
    longitude?: number | null
  }

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

  // Atualiza o endereço
  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      label: data.label,
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  })

  // Retorna uma resposta de sucesso com os detalhes do endereço atualizado
  return reply.status(200).send({
    message: 'Address updated successfully',
    address: {
      id: updatedAddress.id,
      label: updatedAddress.label,
      street: updatedAddress.street,
      city: updatedAddress.city,
      state: updatedAddress.state,
      zipCode: updatedAddress.zipCode,
      number: updatedAddress.number,
      complement: updatedAddress.complement,
      neighborhood: updatedAddress.neighborhood,
      latitude: updatedAddress.latitude
        ? Number(updatedAddress.latitude)
        : null,
      longitude: updatedAddress.longitude
        ? Number(updatedAddress.longitude)
        : null,
    },
  })
}
