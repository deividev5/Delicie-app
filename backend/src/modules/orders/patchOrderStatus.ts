import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

// Mapeamento das transições de status permitidas pelo admin
const allowedTransitions: Record<string, string[]> = {
  CONFIRMED: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['OUT_FOR_DELIVERY'],
}

export async function patchOrderStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O ID do pedido é obtido a partir dos parâmetros da rota, permitindo que o admin especifique qual pedido deseja atualizar
  const { id } = request.params as { id: string }
  //  O novo status desejado é obtido a partir do corpo da requisição, permitindo que o admin informe para qual status deseja atualizar o pedido
  const { status } = request.body as { status: string }

  // Verifica se o pedido existe
  const order = await prisma.order.findUnique({ where: { id } })

  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  // Verifica se a transição de status é válida
  const validNextStatuses = allowedTransitions[order.status]

  //  Se não houver transições permitidas a partir do status atual ou se o novo status não estiver entre os permitidos, retorna um erro
  if (!validNextStatuses || !validNextStatuses.includes(status)) {
    return reply.status(400).send({
      message: `Cannot transition from ${order.status} to ${status}`,
    })
  }

  // Atualiza o status do pedido
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: status as never },
  })

  // Retorna uma resposta de sucesso com o novo status do pedido
  return reply.status(200).send({
    message: 'Order status updated successfully',
    order: {
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
    },
  })
}
