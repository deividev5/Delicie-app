import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function getSizesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Obter a lista de tamanhos ordenada por sortOrder
  const sizes = await prisma.size.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
  })

  // Retornar a lista de tamanhos
  return reply.status(200).send({
    message: 'Sizes retrieved successfully',
    sizes: sizes.map((size) => ({
      id: size.id,
      name: size.name,
      slices: size.slices,
      sortOrder: size.sortOrder,
    })),
  })
}
