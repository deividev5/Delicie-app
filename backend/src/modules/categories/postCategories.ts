import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function postCategoriesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai os dados do corpo da requisição e os tipa usando TypeScript
  const data = request.body as {
    name: string
    description?: string
    imageUrl?: string
    isActive: boolean
    sortOrder: number
  }

  // Verifica se já existe uma categoria com o mesmo nome
  const sameCategory = await prisma.category.findUnique({
    where: { name: data.name },
  })

  // Se já existir uma categoria com o mesmo nome, retorna um erro 400
  if (sameCategory) {
    return reply.status(400).send({
      message: 'Category with the same name already exists',
    })
  }

  // Cria uma nova categoria no banco de dados usando o Prisma
  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  })

  // Retorna uma resposta de sucesso com os dados da categoria criada
  return reply.status(201).send({
    message: 'Category created successfully',
    category: {
      id: category.id,
      name: category.name,
      desription: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    },
  })
}
