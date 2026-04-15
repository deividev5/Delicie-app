import { v2 as cloudinary } from 'cloudinary'
import { env } from '../env/index.ts'

cloudinary.config(env.CLOUDINARY_URL)

export { cloudinary }
