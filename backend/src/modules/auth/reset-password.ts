import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'
import { hash } from 'bcryptjs'

export async function resetPasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Body já validado pelo schema Zod da rota
  const { email, token, password } = request.body as {
    email: string
    token: string
    password: string
  }

  // Normaliza o email para lowercase para garantir consistência na busca no banco de dados
  const normalizedEmail = email.toLowerCase()

  //    Busca o usuário no banco de dados pelo email fornecido
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  // Verifica se o usuário existe e se o token de reset é válido
  if (!user || !user.resetToken || !user.resetTokenExpires) {
    return reply.status(400).send({
      message: 'Invalid or expired reset token',
    })
  }

  // Verifica se o token expirou
  if (user.resetTokenExpires < new Date()) {
    return reply.status(400).send({
      message: 'Invalid or expired reset token',
    })
  }

  // Compara o código de 6 caracteres enviado com o início do token armazenado
  const expectedCode = user.resetToken.slice(0, 6).toUpperCase()

  // Verifica se o código fornecido pelo usuário corresponde ao código esperado
  if (token.toUpperCase() !== expectedCode) {
    return reply.status(400).send({
      message: 'Invalid or expired reset token',
    })
  }

  // Gera o hash da nova senha para armazenar no banco de dados
  const hashedPassword = await hash(password, 10)

  // Atualiza a senha e limpa o token de reset
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      tokenVersion: { increment: 1 }, // Invalida todos os refresh tokens
    },
  })

  return reply.status(200).send({
    message: 'Password reset successfully',
  })
}
