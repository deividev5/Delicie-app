import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'
import { compare } from 'bcryptjs'

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Body já validado pelo schema Zod da rota
  const { email, password } = request.body as {
    email: string
    password: string
  }

  // Normaliza o email para lowercase para garantir consistência na busca no banco de dados
  const normalizedEmail = email.toLowerCase()

  // Busca o usuário no banco de dados pelo email fornecido
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  // Se o usuário não for encontrado ou a senha for inválida, retorna um erro 401 Unauthorized
  if (!user) {
    return reply.status(401).send({
      message: 'Invalid email or password',
    })
  }

  // Compara a senha fornecida com o hash armazenado no banco de dados
  const isPasswordValid = await compare(password, user.password)

  // Se a senha for inválida, retorna um erro 401 Unauthorized
  if (!isPasswordValid) {
    return reply.status(401).send({
      message: 'Invalid email or password',
    })
  }

  // Access token curto para uso nas requisições
  const accessToken = await reply.jwtSign(
    { role: user.role },
    {
      sub: user.id,
      expiresIn: '15m',
    },
  )

  // Refresh token longo para renovar o access token
  const refreshToken = await reply.jwtSign(
    { type: 'refresh', tokenVersion: user.tokenVersion },
    {
      sub: user.id,
      expiresIn: '7d',
    },
  )

  // Retorna os tokens e os dados do usuário (excluindo a senha) em caso de login bem-sucedido
  return reply.status(200).send({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}
