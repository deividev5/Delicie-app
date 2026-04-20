import { FastifyReply, FastifyRequest } from 'fastify'

export async function adminAuthorization(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
