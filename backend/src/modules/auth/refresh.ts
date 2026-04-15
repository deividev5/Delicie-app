import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function refreshController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { refreshToken } = request.body as { refreshToken: string }

  try {
    // Verifica se o refresh token é válido
    const decoded = request.server.jwt.verify<{
      sub: string
      type: string
      tokenVersion: number
    }>(refreshToken)

    // Garante que é um refresh token e não um access token
    if (decoded.type !== 'refresh') {
      return reply.status(401).send({
        message: 'Invalid refresh token',
      })
    }

    // Busca o usuário para verificar a versão do token
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { tokenVersion: true, role: true },
    })

    // Se o usuário não existe ou a versão do token não bate, o token foi invalidado (logout)
    if (!user || decoded.tokenVersion !== user.tokenVersion) {
      return reply.status(401).send({
        message: 'Token has been revoked',
      })
    }

    // Gera um novo access token
    const accessToken = await reply.jwtSign(
      { role: user.role },
      {
        sign: {
          sub: decoded.sub,
          expiresIn: '15m',
        },
      },
    )

    return reply.status(200).send({
      accessToken,
    })
  } catch {
    return reply.status(401).send({
      message: 'Invalid or expired refresh token',
    })
  }
}
