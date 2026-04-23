import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getAdminOrdersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O endpoint de listagem de pedidos para administradores pode aceitar um parâmetro de consulta opcional "status" para filtrar os pedidos por status (e.g., "pending", "preparing", "out_for_delivery", "delivered", "cancelled")
  const { status } = request.query as { status?: string }

  // Busca todos os pedidos com filtro opcional por status
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, phone: true } },
      deliveryPerson: { select: { name: true } },
      address: {
        select: { street: true, number: true, neighborhood: true, city: true },
      },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  })

  // Retorna uma resposta de sucesso com todos os pedidos encontrados
  return reply.status(200).send({
    message: 'Orders retrieved successfully',
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      customer: { name: order.customer.name, phone: order.customer.phone },
      deliveryPerson: order.deliveryPerson
        ? { name: order.deliveryPerson.name }
        : null,
      address: {
        street: order.address.street,
        number: order.address.number,
        neighborhood: order.address.neighborhood,
        city: order.address.city,
      },
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      totalAmount: Number(order.totalAmount),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    })),
  })
}
