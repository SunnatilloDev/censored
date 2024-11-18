import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(__dirname, '..', '..', 'uploads'); // Specify the uploads directory

  constructor() {
    // Ensure the upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = v4() + file.originalname;
      const filePath = path.join(this.uploadDir, fileName);

      // Write the file to the upload directory
      fs.writeFileSync(filePath, file.buffer);

      return '/upload/' + fileName;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new InternalServerErrorException('Failed to save file');
    }
  }
}
