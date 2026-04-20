import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function putCategoriesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o ID da categoria dos parâmetros da rota e os dados do corpo da requisição, tipando-os usando TypeScript
  const { id } = request.params as { id: string }

  // Verifica se a categoria existe
  const data = request.body as {
    name?: string
    description?: string
    imageUrl?: string
    isActive?: boolean
    sortOrder?: number
  }

  // Rejeita requisições sem nenhum campo para atualizar
  if (Object.values(data).every((v) => v === undefined)) {
    return reply.status(400).send({
      message: 'At least one field must be provided',
    })
  }

  // Verifica se a categoria existe no banco de dados
  const category = await prisma.category.findUnique({
    where: { id },
  })

  // Se a categoria não for encontrada, retorna um erro 404
  if (!category) {
    return reply.status(404).send({
      message: 'Category not found',
    })
  }

  // Verifica se já existe outra categoria com o mesmo nome
  if (data.name && data.name !== category.name) {
    const sameCategory = await prisma.category.findUnique({
      where: { name: data.name },
    })
    if (sameCategory) {
      return reply.status(400).send({
        message: 'Category with the same name already exists',
      })
    }
  }

  // Atualiza a categoria com os dados fornecidos no corpo da requisição
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  })

  // Retorna uma resposta de sucesso com os detalhes da categoria atualizada
  return reply.status(200).send({
    message: 'Category updated successfully',
    category: {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      imageUrl: updatedCategory.imageUrl,
      isActive: updatedCategory.isActive,
      sortOrder: updatedCategory.sortOrder,
    },
  })
}
