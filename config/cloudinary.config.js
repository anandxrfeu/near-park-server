import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

// Não esquecer de criar as variáveis de ambiente no .env com as chaves da API do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pictures", // Aqui você pode escolher o nome da pasta que irá armazenar seus arquivos no Cloudinary
    // Na opção format podemos escolher o formato resultante da imagem que será armazenada no Cloudinary
    format: async (req, file) => "png",
    use_filename: true,
  },
});

const fileUpload = multer({ storage: storage });

module.exports = fileUpload
