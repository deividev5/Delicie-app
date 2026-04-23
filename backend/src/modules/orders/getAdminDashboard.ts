import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getAdminDashboardController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Define o intervalo do dia atual para as consultas
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  //  Define o início do dia seguinte para criar um intervalo de 24 horas
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Executa as consultas de forma paralela para melhor desempenho
  const [ordersByStatus, todayRevenue] = await prisma.$transaction([
    prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: {
          notIn: ['CANCELLED', 'AWAITING_PAYMENT', 'CREATED'],
        },
      },
      _sum: { totalAmount: true },
    }),
  ])

  // Calcula o total de pedidos do dia somando as contagens por status
  const totalToday = ordersByStatus.reduce((sum, s) => sum + s._count.id, 0)

  // Retorna uma resposta de sucesso com o resumo do dia
  return reply.status(200).send({
    message: 'Dashboard retrieved successfully',
    dashboard: {
      totalOrdersToday: totalToday,
      revenueToday: Number(todayRevenue._sum.totalAmount ?? 0),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
    },
  })
}
