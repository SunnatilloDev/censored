import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = v4() + path.extname(file.originalname); // Generate unique name
          cb(null, fileName);
        },
      }),
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class AppModule {}
