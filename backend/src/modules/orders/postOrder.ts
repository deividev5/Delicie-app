import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function postOrderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O ID do cliente é obtido a partir do token JWT, garantindo que o cliente só possa criar pedidos para si mesmo
  const customerId = request.user.sub

  // Valida os dados de entrada e verifica se o endereço pertence ao cliente logado
  const data = request.body as {
    addressId: string
    notes?: string
    items: Array<{
      productId: string
      sizeId?: string
      quantity: number
      notes?: string
    }>
  }

  // Verifica se o endereço pertence ao cliente logado
  const address = await prisma.address.findFirst({
    where: { id: data.addressId, userId: customerId },
  })

  // Se o endereço não for encontrado ou não pertencer ao cliente, retorna um erro 404
  if (!address) {
    return reply.status(404).send({ message: 'Address not found' })
  }

  // Valida cada item e calcula o preço unitário
  const itemsWithPrices = []

  // Para cada item, verifica se o produto existe e está ativo, e calcula o preço unitário com base no tamanho (se aplicável)
  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    })

    // Se o produto não existir ou estiver inativo, retorna um erro 400
    if (!product || !product.isActive) {
      return reply.status(400).send({
        message: `Product ${item.productId} not found or inactive`,
      })
    }

    // Verifica se a quantidade é válida
    if (item.quantity <= 0) {
      return reply.status(400).send({
        message: `Invalid quantity for product ${item.productId}`,
      })
    }

    // Variável para armazenar o preço unitário do item, que pode variar dependendo do tamanho selecionado
    let unitPrice: number

    // Se o item tiver um sizeId, busca o preço específico para aquele tamanho do produto
    if (item.sizeId) {
      // Busca o preço do tamanho específico do produto
      const productSize = await prisma.productSize.findUnique({
        where: {
          productId_sizeId: {
            productId: item.productId,
            sizeId: item.sizeId,
          },
        },
      })

      // Se o tamanho não for encontrado para o produto, retorna um erro 400
      if (!productSize) {
        return reply.status(400).send({
          message: `Size not available for product ${item.productId}`,
        })
      }

      // O preço unitário é o preço específico do tamanho do produto
      unitPrice = Number(productSize.price)
    } else {
      // Se não houver tamanho específico, usa o preço base do produto
      unitPrice = Number(product.basePrice)
    }

    // Adiciona o item com o preço calculado à lista de itens do pedido
    itemsWithPrices.push({
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: item.quantity,
      notes: item.notes,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    })
  }

  // Calcula o subtotal e o valor total do pedido no backend
  const subtotal = itemsWithPrices.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  )
  const deliveryFee = 6.0 // TODO: calcular com base nas configurações de entrega
  const totalAmount = subtotal + deliveryFee

  // Cria o pedido, os itens e o pagamento em uma única operação
  const order = await prisma.order.create({
    data: {
      customerId,
      addressId: data.addressId,
      status: 'AWAITING_PAYMENT',
      subtotal,
      deliveryFee,
      totalAmount,
      notes: data.notes,
      items: {
        create: itemsWithPrices.map((item) => ({
          productId: item.productId,
          sizeId: item.sizeId,
          quantity: item.quantity,
          notes: item.notes,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      },
      payment: {
        create: {
          method: 'PIX',
          amount: totalAmount,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos para expirar
        },
      },
    },
    include: {
      payment: true,
    },
  })

  // Retorna uma resposta de sucesso com os dados do pedido criado
  return reply.status(201).send({
    message: 'Order created successfully',
    order: {
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      totalAmount: Number(order.totalAmount),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      payment: order.payment
        ? {
            id: order.payment.id,
            status: order.payment.status,
            expiresAt: order.payment.expiresAt?.toISOString() ?? null,
          }
        : null,
    },
  })
}
