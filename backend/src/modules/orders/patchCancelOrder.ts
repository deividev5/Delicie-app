import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function patchCancelOrderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Obtém o ID do cliente logado e o ID do pedido a ser cancelado
  const customerId = request.user.sub
  // O ID do pedido é passado como parâmetro na URL
  const { id } = request.params as { id: string }

  // Verifica se o pedido existe
  const order = await prisma.order.findUnique({
    where: { id },
  })

  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  // Verifica se o pedido pertence ao cliente logado
  if (order.customerId !== customerId) {
    return reply.status(403).send({ message: 'Forbidden' })
  }

  // Verifica se o pedido está em um status que permite cancelamento
  const cancellableStatuses = ['CREATED', 'AWAITING_PAYMENT']

  //  Se o status do pedido não permitir cancelamento, retorna um erro
  if (!cancellableStatuses.includes(order.status)) {
    return reply.status(400).send({
      message: 'Order cannot be cancelled at this stage',
    })
  }

  // Cancela o pedido e registra a data de cancelamento
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })

  // Retorna uma resposta de sucesso indicando que o pedido foi cancelado
  return reply.status(200).send({
    message: 'Order cancelled successfully',
    order: {
      id: updatedOrder.id,
      status: updatedOrder.status,
      cancelledAt: updatedOrder.cancelledAt?.toISOString() ?? null,
    },
  })
}
