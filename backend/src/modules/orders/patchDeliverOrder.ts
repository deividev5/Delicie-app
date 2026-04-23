import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function patchDeliverOrderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Obtém o ID do entregador logado e o ID do pedido a ser marcado como entregue
  const userId = request.user.sub
  // O ID do pedido é passado como parâmetro na URL
  const { id } = request.params as { id: string }

  // Verifica se o pedido existe
  const order = await prisma.order.findUnique({ where: { id } })

  // Se o pedido não for encontrado, retorna um erro 404
  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  // Verifica se o pedido foi atribuído ao entregador logado
  if (order.deliveryPersonId !== userId) {
    return reply.status(403).send({ message: 'Forbidden' })
  }

  // Verifica se o pedido está no status correto para ser marcado como entregue
  if (order.status !== 'OUT_FOR_DELIVERY') {
    return reply.status(400).send({
      message: 'Order must be in OUT_FOR_DELIVERY status to mark as delivered',
    })
  }

  // Atualiza o pedido para DELIVERED e registra a data de entrega
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  })

  // Retorna uma resposta de sucesso indicando que o pedido foi entregue
  return reply.status(200).send({
    message: 'Order delivered successfully',
    order: {
      id: updatedOrder.id,
      status: updatedOrder.status,
      deliveredAt: updatedOrder.deliveredAt,
    },
  })
}
