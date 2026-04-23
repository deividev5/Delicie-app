import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function patchAssignDeliveryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O ID do pedido a ser atualizado é obtido a partir dos parâmetros da rota, permitindo que o cliente especifique qual pedido deseja atualizar
  const { id } = request.params as { id: string }
  // O ID do entregador a ser atribuído ao pedido é obtido a partir do corpo da requisição, permitindo que o cliente informe qual entregador deve ser designado para o pedido
  const { deliveryPersonId } = request.body as { deliveryPersonId: string }

  // Verifica se o pedido existe
  const order = await prisma.order.findUnique({ where: { id } })

  // Se o pedido não for encontrado, retorna um erro 404
  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  // Verifica se o pedido está no status READY para receber um entregador
  if (order.status !== 'READY') {
    return reply.status(400).send({
      message: 'Order must be in READY status to assign a delivery person',
    })
  }

  // Verifica se o entregador existe e está disponível
  const deliveryUser = await prisma.user.findUnique({
    where: { id: deliveryPersonId },
    include: { deliveryPerson: true },
  })

  // Se o entregador não for encontrado ou não tiver o papel de DELIVERY, retorna um erro
  if (!deliveryUser || deliveryUser.role !== 'DELIVERY') {
    return reply.status(400).send({ message: 'Delivery person not found' })
  }

  // Se o entregador não estiver disponível, retorna um erro
  if (!deliveryUser.deliveryPerson?.isAvailable) {
    return reply.status(400).send({
      message: 'Delivery person is not available',
    })
  }

  // Atribui o entregador ao pedido e muda o status para OUT_FOR_DELIVERY
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      deliveryPersonId,
      status: 'OUT_FOR_DELIVERY',
    },
  })

  // Retorna uma resposta de sucesso com os dados atualizados do pedido
  return reply.status(200).send({
    message: 'Delivery person assigned successfully',
    order: {
      id: updatedOrder.id,
      status: updatedOrder.status,
      deliveryPersonId: updatedOrder.deliveryPersonId,
    },
  })
}
