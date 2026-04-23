import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getOrderByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O ID do usuário e seu papel são obtidos a partir do token JWT, garantindo que o cliente só possa acessar seus próprios pedidos e os entregadores só possam acessar os pedidos que estão entregando
  const userId = request.user.sub
  // O papel do usuário é importante para determinar se ele tem permissão para acessar o pedido solicitado
  const role = request.user.role
  // O ID do pedido é obtido a partir dos parâmetros da rota
  const { id } = request.params as { id: string }

  // Busca o pedido pelo ID com todas as informações relacionadas
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } },
          size: { select: { name: true } },
        },
      },
      address: true,
      payment: true,
    },
  })

  // Se o pedido não for encontrado, retorna um erro 404
  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  // Verifica se o usuário tem permissão para visualizar este pedido
  if (
    (role === 'CUSTOMER' && order.customerId !== userId) ||
    (role === 'DELIVERY' && order.deliveryPersonId !== userId)
  ) {
    return reply.status(403).send({ message: 'Forbidden' })
  }

  // Retorna uma resposta de sucesso com os detalhes do pedido
  return reply.status(200).send({
    message: 'Order retrieved successfully',
    order: {
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      totalAmount: Number(order.totalAmount),
      notes: order.notes,
      paidAt: order.paidAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      address: {
        id: order.address.id,
        label: order.address.label,
        street: order.address.street,
        number: order.address.number,
        complement: order.address.complement,
        neighborhood: order.address.neighborhood,
        city: order.address.city,
        state: order.address.state,
        zipCode: order.address.zipCode,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImageUrl: item.product.imageUrl,
        sizeId: item.sizeId,
        sizeName: item.size?.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes,
      })),
      payment: order.payment
        ? {
            id: order.payment.id,
            status: order.payment.status,
            method: order.payment.method,
            pixQrCode: order.payment.pixQrCode,
            pixCopyPaste: order.payment.pixCopyPaste,
            expiresAt: order.payment.expiresAt?.toISOString() ?? null,
            confirmedAt: order.payment.confirmedAt?.toISOString() ?? null,
          }
        : null,
    },
  })
}
