import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

function filenameEdit(req: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
  const name = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, '');
  const fileExtName = extname(file.originalname);
  const randomName = Array(6)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${Date.now()}-${randomName}${fileExtName}`);
}

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: filenameEdit,
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = `/uploads/${file.filename}`;
    return { url };
  }
}
