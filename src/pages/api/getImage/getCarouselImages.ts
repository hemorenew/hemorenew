/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  const carouselDir = path.join(process.cwd(), 'public/carousel');
  const imageFiles = fs
    .readdirSync(carouselDir)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map((file) => `/carousel/${file}`);

  res.status(200).json(imageFiles);
}
