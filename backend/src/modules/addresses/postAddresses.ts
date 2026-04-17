import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function PostAddressesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai os dados do corpo da requisição e os tipa usando TypeScript
  const data = request.body as {
    label: string
    street: string
    city: string
    state: string
    zipCode: string
    number: string
    complement?: string
    neighborhood: string
    latitude?: number
    longitude?: number
  }

  // Verifica se o usuário já possui algum endereço cadastrado
  const addressCount = await prisma.address.count({
    where: { userId: request.user.sub },
  })

  // Cria um novo endereço associado ao usuário logado
  const newAddress = await prisma.address.create({
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
      isDefault: addressCount === 0, // Primeiro endereço é o padrão
      userId: request.user.sub,
    },
  })

  // Retorna uma resposta de sucesso com os detalhes do novo endereço criado
  return reply.status(201).send({
    message: 'Address created successfully',
    address: {
      id: newAddress.id,
      label: newAddress.label,
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
      number: newAddress.number,
      complement: newAddress.complement,
      neighborhood: newAddress.neighborhood,
      latitude: newAddress.latitude ? Number(newAddress.latitude) : null,
      longitude: newAddress.longitude ? Number(newAddress.longitude) : null,
    },
  })
}
