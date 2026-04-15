import { FastifyReply, FastifyRequest } from 'fastify'

// Middleware para verificar o token JWT em rotas protegidas
export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
