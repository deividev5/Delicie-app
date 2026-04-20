import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'

export async function deleteCategoriesContoller(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o ID da categoria dos parâmetros da rota, tipando-o usando TypeScript
  const { id } = request.params as { id: string }

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

  // Verifica se existem produtos associados à categoria
  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  })

  if (productsCount > 0) {
    return reply.status(400).send({
      message: 'Category has associated products and cannot be deleted',
    })
  }

  // Deleta a categoria do banco de dados
  await prisma.category.delete({
    where: { id },
  })

  // Retorna uma resposta de sucesso indicando que a categoria foi excluída
  return reply.status(200).send({
    message: 'Category deleted successfully',
  })
}
