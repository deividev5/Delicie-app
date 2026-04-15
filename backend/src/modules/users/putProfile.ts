import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

// Controlador para lidar com a lógica de atualização do perfil do usuário
export async function UpdateProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = request.body as {
    name?: string
    email?: string
    phone?: string
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

  // Verifica se o email já está em uso por outro usuário
  if (data.email) {
    const emailAlreadyInUse = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: user.id },
      },
    })

    if (emailAlreadyInUse) {
      return reply.status(409).send({
        message: 'Email already in use',
      })
    }
  }

  // Atualiza os dados do usuário no banco de dados
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
  })

  // Retorna os dados atualizados do usuário
  reply.status(200).send({
    message: 'User profile updated successfully',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    },
  })
}
