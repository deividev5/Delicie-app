import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function postSizesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Validação de campos obrigatórios
  const data = request.body as {
    name: string
    slices: number
    sortOrder: number
  }

  // Verificar se o nome do tamanho já existe
  const sameSize = await prisma.size.findUnique({
    where: { name: data.name },
  })

  // Se existir, retornar erro
  if (sameSize) {
    return reply.status(400).send({
      message: 'Size with the same name already exists',
    })
  }

  // Criar o novo tamanho
  const size = await prisma.size.create({
    data: {
      name: data.name,
      slices: data.slices,
      sortOrder: data.sortOrder,
    },
  })

  // Retornar o tamanho criado
  return reply.status(201).send({
    message: 'Size created successfully',
    size: {
      id: size.id,
      name: size.name,
      slices: size.slices,
      sortOrder: size.sortOrder,
    },
  })
}
