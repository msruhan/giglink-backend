import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: 'dovcmw18b', // atau pakai process.env.CLOUDINARY_CLOUD_NAME
  api_key: '464249994686949', // atau pakai process.env.CLOUDINARY_API_KEY
  api_secret: 'Ur8xl-by5eufaYOzHzNei_Sn0Pw', // atau pakai process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;