import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getOrderStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O ID do usuário e o papel são obtidos a partir do token JWT, garantindo que o cliente só possa visualizar o status de seus próprios pedidos e os entregadores só possam visualizar os pedidos que estão entregando
  const userId = request.user.sub
  // O papel do usuário é necessário para verificar as permissões de acesso ao status do pedido
  const role = request.user.role
  // O ID do pedido é obtido a partir dos parâmetros da rota, permitindo que o cliente ou entregador especifique qual pedido deseja consultar
  const { id } = request.params as { id: string }

  // Busca apenas os campos necessários para verificar o status
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      customerId: true,
      deliveryPersonId: true,
      updatedAt: true,
    },
  })

  // Se o pedido não for encontrado, retorna um erro 404
  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  // Verifica se o usuário tem permissão para visualizar o status do pedido
  if (
    (role === 'CUSTOMER' && order.customerId !== userId) ||
    (role === 'DELIVERY' && order.deliveryPersonId !== userId)
  ) {
    return reply.status(403).send({ message: 'Forbidden' })
  }

  // Retorna uma resposta de sucesso com o status atual do pedido
  return reply.status(200).send({
    message: 'Order status retrieved successfully',
    id: order.id,
    status: order.status,
    updatedAt: order.updatedAt.toISOString(),
  })
}
