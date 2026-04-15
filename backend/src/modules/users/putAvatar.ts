import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'
import { cloudinary } from '../../lib/cloudinary.ts'

export async function UpdateAvatarController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Obtém o arquivo enviado na requisição
  const file = await request.file()

  // Se nenhum arquivo for enviado, retorna um erro 400 Bad Request
  if (!file) {
    return reply.status(400).send({
      message: 'No file uploaded',
    })
  }

  // Define os tipos MIME permitidos para upload de avatar
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

  // Verifica se o tipo MIME do arquivo enviado é permitido
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return reply.status(400).send({
      message: 'Invalid file type. Only JPEG, PNG and WebP are allowed',
    })
  }

  // Busca o usuário logado no banco de dados usando o ID presente no token JWT
  const user = await prisma.user.findFirst({
    where: { id: request.user.sub },
  })

  // Se o usuário não for encontrado, retorna um erro 404 Not Found
  if (!user) {
    return reply.status(404).send({
      message: 'User not found',
    })
  }

  // Remove o avatar antigo do Cloudinary se existir
  if (user.avatarUrl) {
    const publicId = user.avatarUrl.split('/').slice(-2).join('/').split('.')[0]
    await cloudinary.uploader.destroy(publicId).catch(() => {})
  }

  // Converte o arquivo enviado para um buffer para upload no Cloudinary
  const buffer = await file.toBuffer()

  // Faz o upload do novo avatar para o Cloudinary e obtém a URL segura do arquivo
  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'delicie/avatars',
            resource_type: 'image',
            transformation: [
              {
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
              },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve({ secure_url: result.secure_url })
          },
        )
        .end(buffer)
    },
  )

  // Atualiza a URL do avatar do usuário no banco de dados
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: result.secure_url },
  })

  // Retorna a URL do novo avatar para o cliente
  reply.status(200).send({
    message: 'Avatar updated successfully',
    avatarUrl: result.secure_url,
  })
}
