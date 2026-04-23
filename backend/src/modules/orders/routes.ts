import { z } from 'zod'
import { FastifyTypedInstance } from '../../types/fastify.ts'
import { verifyJwt } from '../../middleware/verify-jwt.ts'
import { customerAuthorization } from '../../middleware/costumerAuthorization.ts'
import { adminAuthorization } from '../../middleware/adminAuthAuthorization.ts'
import { deliveryAuthorization } from '../../middleware/deliveryAuthorization.ts'
import { postOrderController } from './postOrder.ts'
import { getOrdersController } from './getOrders.ts'
import { getOrderByIdController } from './getOrderById.ts'
import { getOrderStatusController } from './getOrderStatus.ts'
import { patchCancelOrderController } from './patchCancelOrder.ts'
import { getAdminOrdersController } from './getAdminOrders.ts'
import { getAdminDashboardController } from './getAdminDashboard.ts'
import { patchOrderStatusController } from './patchOrderStatus.ts'
import { patchAssignDeliveryController } from './patchAssignDelivery.ts'
import { getDeliveryOrdersController } from './getDeliveryOrders.ts'
import { patchDeliverOrderController } from './patchDeliverOrder.ts'

export async function orderRoutes(app: FastifyTypedInstance) {
  // POST / - Criar pedido (Customer)
  app.post(
    '/',
    {
      onRequest: [customerAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Cria um novo pedido',
        body: z.object({
          addressId: z.string(),
          notes: z.string().optional(),
          items: z
            .array(
              z.object({
                productId: z.string(),
                sizeId: z.string().optional(),
                quantity: z.coerce.number().int().min(1),
                notes: z.string().optional(),
              }),
            )
            .min(1),
        }),
        response: {
          201: z.object({
            message: z.string(),
            order: z.object({
              id: z.string(),
              status: z.string(),
              subtotal: z.number(),
              deliveryFee: z.number(),
              totalAmount: z.number(),
              notes: z.string().optional().nullable(),
              createdAt: z.string(),
              payment: z
                .object({
                  id: z.string(),
                  status: z.string(),
                  expiresAt: z.string().nullable(),
                })
                .nullable(),
            }),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    postOrderController,
  )

  // GET / - Listar pedidos do cliente logado (Customer)
  app.get(
    '/',
    {
      onRequest: [customerAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Lista os pedidos do cliente logado',
        response: {
          200: z.object({
            message: z.string(),
            orders: z.array(
              z.object({
                id: z.string(),
                status: z.string(),
                subtotal: z.number(),
                deliveryFee: z.number(),
                totalAmount: z.number(),
                notes: z.string().optional().nullable(),
                createdAt: z.string(),
                items: z.array(
                  z.object({
                    id: z.string(),
                    productId: z.string(),
                    productName: z.string(),
                    sizeId: z.string().optional().nullable(),
                    sizeName: z.string().optional().nullable(),
                    quantity: z.number(),
                    unitPrice: z.number(),
                    totalPrice: z.number(),
                    notes: z.string().optional().nullable(),
                  }),
                ),
              }),
            ),
          }),
        },
      },
    },
    getOrdersController,
  )

  // GET /admin/all - Listar todos os pedidos (Admin)
  app.get(
    '/admin/all',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Orders'],
        description:
          'Lista todos os pedidos com filtro opcional por status (admin)',
        querystring: z.object({
          status: z
            .enum([
              'CREATED',
              'AWAITING_PAYMENT',
              'CONFIRMED',
              'PREPARING',
              'READY',
              'OUT_FOR_DELIVERY',
              'DELIVERED',
              'CANCELLED',
            ])
            .optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            orders: z.array(
              z.object({
                id: z.string(),
                status: z.string(),
                customer: z.object({ name: z.string(), phone: z.string() }),
                deliveryPerson: z.object({ name: z.string() }).nullable(),
                address: z.object({
                  street: z.string(),
                  number: z.string(),
                  neighborhood: z.string(),
                  city: z.string(),
                }),
                subtotal: z.number(),
                deliveryFee: z.number(),
                totalAmount: z.number(),
                notes: z.string().optional().nullable(),
                createdAt: z.string(),
                items: z.array(
                  z.object({
                    productName: z.string(),
                    quantity: z.number(),
                    unitPrice: z.number(),
                    totalPrice: z.number(),
                  }),
                ),
              }),
            ),
          }),
        },
      },
    },
    getAdminOrdersController,
  )

  // GET /admin/dashboard - Resumo do dia (Admin)
  app.get(
    '/admin/dashboard',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Dashboard com resumo de pedidos e receita do dia (admin)',
        response: {
          200: z.object({
            message: z.string(),
            dashboard: z.object({
              totalOrdersToday: z.number(),
              revenueToday: z.number(),
              ordersByStatus: z.array(
                z.object({
                  status: z.string(),
                  count: z.number(),
                }),
              ),
            }),
          }),
        },
      },
    },
    getAdminDashboardController,
  )

  // GET /delivery/my - Pedidos do entregador logado (Delivery)
  app.get(
    '/delivery/my',
    {
      onRequest: [deliveryAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Lista os pedidos atribuídos ao entregador logado',
        response: {
          200: z.object({
            message: z.string(),
            orders: z.array(
              z.object({
                id: z.string(),
                status: z.string(),
                customer: z.object({ name: z.string(), phone: z.string() }),
                address: z.object({
                  street: z.string(),
                  number: z.string(),
                  complement: z.string().optional().nullable(),
                  neighborhood: z.string(),
                  city: z.string(),
                  zipCode: z.string(),
                }),
                totalAmount: z.number(),
                notes: z.string().optional().nullable(),
                createdAt: z.string(),
                items: z.array(
                  z.object({
                    productName: z.string(),
                    sizeName: z.string().optional().nullable(),
                    quantity: z.number(),
                  }),
                ),
              }),
            ),
          }),
        },
      },
    },
    getDeliveryOrdersController,
  )

  // GET /:id - Detalhes de um pedido (Autenticado)
  app.get(
    '/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Orders'],
        description: 'Retorna os detalhes de um pedido específico',
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({
            message: z.string(),
            order: z.object({
              id: z.string(),
              status: z.string(),
              subtotal: z.number(),
              deliveryFee: z.number(),
              totalAmount: z.number(),
              notes: z.string().optional().nullable(),
              paidAt: z.string().nullable(),
              deliveredAt: z.string().nullable(),
              cancelledAt: z.string().nullable(),
              createdAt: z.string(),
              address: z.object({
                id: z.string(),
                label: z.string(),
                street: z.string(),
                number: z.string(),
                complement: z.string().optional().nullable(),
                neighborhood: z.string(),
                city: z.string(),
                state: z.string(),
                zipCode: z.string(),
              }),
              items: z.array(
                z.object({
                  id: z.string(),
                  productId: z.string(),
                  productName: z.string(),
                  productImageUrl: z.string().optional().nullable(),
                  sizeId: z.string().optional().nullable(),
                  sizeName: z.string().optional().nullable(),
                  quantity: z.number(),
                  unitPrice: z.number(),
                  totalPrice: z.number(),
                  notes: z.string().optional().nullable(),
                }),
              ),
              payment: z
                .object({
                  id: z.string(),
                  status: z.string(),
                  method: z.string(),
                  pixQrCode: z.string().nullable(),
                  pixCopyPaste: z.string().nullable(),
                  expiresAt: z.string().nullable(),
                  confirmedAt: z.string().nullable(),
                })
                .nullable(),
            }),
          }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    getOrderByIdController,
  )

  // GET /:id/status - Status atual do pedido (Autenticado)
  app.get(
    '/:id/status',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Orders'],
        description: 'Retorna o status atual de um pedido',
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({
            message: z.string(),
            id: z.string(),
            status: z.string(),
            updatedAt: z.string(),
          }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    getOrderStatusController,
  )

  // PATCH /:id/cancel - Cancelar pedido (Customer)
  app.patch(
    '/:id/cancel',
    {
      onRequest: [customerAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Cancela um pedido (apenas antes do pagamento)',
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({
            message: z.string(),
            order: z.object({
              id: z.string(),
              status: z.string(),
              cancelledAt: z.string().nullable(),
            }),
          }),
          400: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    patchCancelOrderController,
  )

  // PATCH /:id/status - Alterar status do pedido (Admin)
  app.patch(
    '/:id/status',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Altera o status de um pedido (admin)',
        params: z.object({ id: z.string() }),
        body: z.object({
          status: z.enum(['PREPARING', 'READY', 'OUT_FOR_DELIVERY']),
        }),
        response: {
          200: z.object({
            message: z.string(),
            order: z.object({
              id: z.string(),
              status: z.string(),
              updatedAt: z.date(),
            }),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    patchOrderStatusController,
  )

  // PATCH /:id/assign - Atribuir entregador ao pedido (Admin)
  app.patch(
    '/:id/assign',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Atribui um entregador disponível ao pedido (admin)',
        params: z.object({ id: z.string() }),
        body: z.object({
          deliveryPersonId: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            order: z.object({
              id: z.string(),
              status: z.string(),
              deliveryPersonId: z.string().nullable(),
            }),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    patchAssignDeliveryController,
  )

  // PATCH /:id/deliver - Marcar pedido como entregue (Delivery)
  app.patch(
    '/:id/deliver',
    {
      onRequest: [deliveryAuthorization],
      schema: {
        tags: ['Orders'],
        description: 'Marca o pedido como entregue (entregador)',
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({
            message: z.string(),
            order: z.object({
              id: z.string(),
              status: z.string(),
              deliveredAt: z.date().nullable(),
            }),
          }),
          400: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    patchDeliverOrderController,
  )
}
