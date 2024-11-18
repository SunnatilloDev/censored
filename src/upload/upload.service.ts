import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises'; // Using promises for non-blocking operations
import * as path from 'path';
import { v4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(__dirname, '..', '..', 'uploads');

  constructor() {
    // Ensure the upload directory exists during service initialization
    fs.mkdir(this.uploadDir, { recursive: true }).catch((err) => {
      console.error('Error creating upload directory:', err);
    });
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = v4() + path.extname(file.originalname); // Generate a unique file name
      const filePath = path.join(this.uploadDir, fileName);

      // Save the file buffer to the uploads directory
      await fs.writeFile(filePath, file.buffer);

      return `/upload/${fileName}`; // Return the relative path for static serving
    } catch (error) {
      console.error('Error saving file:', error);
      throw new InternalServerErrorException('Failed to save file');
    }
  }
}
