import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getOrdersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const customerId = request.user.sub

  // Busca todos os pedidos do cliente logado, ordenados por data de criação
  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
          size: { select: { name: true } },
        },
      },
    },
  })

  // Retorna uma resposta de sucesso com os pedidos encontrados
  return reply.status(200).send({
    message: 'Orders retrieved successfully',
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      totalAmount: Number(order.totalAmount),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        sizeId: item.sizeId,
        sizeName: item.size?.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes,
      })),
    })),
  })
}
