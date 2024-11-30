import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import {
  FileUploadException,
  FileSizeLimitException,
  FileTypeException,
} from '../common/exceptions/custom.exceptions';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          try {
            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
          } catch (error) {
            cb(new FileUploadException('Failed to access upload directory'), null);
          }
        },
        filename: (req, file, cb) => {
          try {
            const uniqueName = v4();
            const extension = path.extname(file.originalname).toLowerCase();
            cb(null, `${uniqueName}${extension}`);
          } catch (error) {
            cb(new FileUploadException('Failed to generate filename'), null);
          }
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(new FileTypeException(allowedMimes), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1,
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
