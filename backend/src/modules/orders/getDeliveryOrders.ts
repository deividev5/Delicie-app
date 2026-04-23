import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getDeliveryOrdersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deliveryPersonId = request.user.sub

  // Busca os pedidos atribuídos ao entregador logado
  const orders = await prisma.order.findMany({
    where: { deliveryPersonId },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, phone: true } },
      address: true,
      items: {
        include: {
          product: { select: { name: true } },
          size: { select: { name: true } },
        },
      },
    },
  })

  // Retorna uma resposta de sucesso com os pedidos do entregador
  return reply.status(200).send({
    message: 'Delivery orders retrieved successfully',
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      customer: { name: order.customer.name, phone: order.customer.phone },
      address: {
        street: order.address.street,
        number: order.address.number,
        complement: order.address.complement,
        neighborhood: order.address.neighborhood,
        city: order.address.city,
        zipCode: order.address.zipCode,
      },
      totalAmount: Number(order.totalAmount),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        productName: item.product.name,
        sizeName: item.size?.name,
        quantity: item.quantity,
      })),
    })),
  })
}
