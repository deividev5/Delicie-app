import { FastifyReply, FastifyRequest } from 'fastify'

export async function deliveryAuthorization(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
    if (request.user.role !== 'DELIVERY') {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
