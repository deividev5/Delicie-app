import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

// Controlador para lidar com a lógica de registro de um novo usuário
export async function ProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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

  // Se o usuário for encontrado, retorna os dados do perfil do usuário
  reply.status(200).send({
    message: 'User profile retrieved successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  })
}
