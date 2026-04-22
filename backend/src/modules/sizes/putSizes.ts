import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function putSizesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Validação de campos obrigatórios
  const { id } = request.params as { id: string }

  // Verificar se pelo menos um campo foi fornecido
  const data = request.body as {
    name?: string
    slices?: number
    sortOrder?: number
  }

  // Se nenhum campo for fornecido, retornar erro
  if (Object.values(data).every((v) => v === undefined)) {
    return reply.status(400).send({
      message: 'At least one field must be provided',
    })
  }

  // Verificar se o tamanho existe
  const size = await prisma.size.findUnique({
    where: { id },
  })

  // Se não existir, retornar erro
  if (!size) {
    return reply.status(404).send({
      message: 'Size not found',
    })
  }

  // Se o nome for fornecido e for diferente do nome atual, verificar se já existe um tamanho com o mesmo nome
  if (data.name && data.name !== size.name) {
    const sameSize = await prisma.size.findUnique({
      where: { name: data.name },
    })
    // Se existir, retornar erro
    if (sameSize) {
      return reply.status(400).send({
        message: 'Size with the same name already exists',
      })
    }
  }

  // Atualizar o tamanho
  const updatedSize = await prisma.size.update({
    where: { id },
    data: {
      name: data.name,
      slices: data.slices,
      sortOrder: data.sortOrder,
    },
  })

  // Retornar o tamanho atualizado
  return reply.status(200).send({
    message: 'Size updated successfully',
    size: {
      id: updatedSize.id,
      name: updatedSize.name,
      slices: updatedSize.slices,
      sortOrder: updatedSize.sortOrder,
    },
  })
}
