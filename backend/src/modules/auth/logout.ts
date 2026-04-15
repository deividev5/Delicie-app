import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function logoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Verifica se o usuário está autenticado (token válido)
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({
      message: 'Not authenticated',
    })
  }

  // Obtém o ID do usuário a partir do token JWT (sub)
  const userId = request.user.sub

  // Incrementa tokenVersion — invalida todos os refresh tokens existentes
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  })

  // Retorna uma resposta de sucesso indicando que o logout foi realizado
  return reply.status(200).send({
    message: 'Logged out successfully',
  })
}
