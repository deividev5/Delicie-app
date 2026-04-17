import { FastifyReply, FastifyRequest } from 'fastify'

export async function customerAuthorization(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
    if (request.user.role !== 'CUSTOMER') {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
