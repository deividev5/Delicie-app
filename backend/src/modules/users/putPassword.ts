import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'
import bcrypt, { compare } from 'bcryptjs'

// Controlador para lidar com a lógica de atualização da senha do usuário
export async function UpdatePasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = request.body as {
    oldPassword: string
    password: string
    confirmPassword: string
  }
  // Busca o usuário logado no banco de dados usando o ID presente no token JWT
  const user = await prisma.user.findFirst({
    where: {
      id: request.user.sub,
    },
  })

  // Se o usuário não for encontrado, retorna um erro 404
  if (!user) {
    return reply.status(404).send({
      message: 'User not found',
    })
  }

  // Verifica se a senha antiga está correta
  if (data.password !== data.confirmPassword) {
    return reply.status(400).send({
      message: 'Password and confirm password do not match',
    })
  }

  // Compara a senha fornecida com o hash armazenado no banco de dados
  const isPasswordValid = await compare(data.oldPassword, user.password)

  // Se a senha for inválida, retorna um erro 400 Bad Request
  if (!isPasswordValid) {
    return reply.status(400).send({
      message: 'Invalid old password',
    })
  }

  // Hash da nova senha antes de armazenar no banco de dados
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Atualiza a senha e incrementa o tokenVersion para invalidar tokens existentes
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 },
    },
  })

  // Gera novos tokens para manter a sessão ativa no dispositivo atual
  const accessToken = await reply.jwtSign(
    { role: updatedUser.role },
    {
      sign: {
        sub: updatedUser.id,
        expiresIn: '15m',
      },
    },
  )

  // Gera um novo refresh token com a nova versão do token para garantir que tokens antigos sejam invalidados
  const refreshToken = await reply.jwtSign(
    { type: 'refresh', tokenVersion: updatedUser.tokenVersion },
    {
      sign: {
        sub: updatedUser.id,
        expiresIn: '7d',
      },
    },
  )

  // Retorna confirmação da atualização com novos tokens
  reply.status(200).send({
    message: 'Password updated successfully',
    accessToken,
    refreshToken,
  })
}
