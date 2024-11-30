import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

  constructor() {
    this.initializeUploadDirectory();
  }

  private async initializeUploadDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory initialized: ${this.uploadDir}`);
      
      // Start cleanup job for files older than 24 hours
      setInterval(() => {
        this.cleanupOldFiles(24 * 60 * 60 * 1000).catch(err => 
          this.logger.error('Cleanup job failed:', err)
        );
      }, 60 * 60 * 1000); // Run every hour
    } catch (error) {
      this.logger.error('Failed to initialize upload directory:', error);
      throw new InternalServerErrorException('Failed to initialize upload system');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      this.logger.log(`Processing upload: ${file.originalname}`);
      
      // Validate file
      await this.validateFile(file);

      // Generate a unique filename with original extension
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${v4()}${extension}`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save the file
      await fs.writeFile(filePath, file.buffer);
      this.logger.log(`File saved: ${fileName}`);

      // Verify the file was written correctly
      const stats = await fs.stat(filePath);
      if (stats.size !== file.buffer.length) {
        this.logger.error(`File verification failed for ${fileName}`);
        await this.deleteFile(fileName);
        throw new Error('File verification failed');
      }

      const baseUrl = process.env.BASE_URL || 'https://legitcommunity.uz';
      return `${baseUrl}/upload/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to save file: ${error.message}`, error.stack);
      if (error.message === 'File verification failed') {
        throw new InternalServerErrorException('Failed to save file: verification error');
      }
      throw new InternalServerErrorException('Failed to save file');
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Invalid file type: file must be an image');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileName = filePath.startsWith('/upload/') 
        ? filePath.slice(8) 
        : path.basename(filePath);

      const fullPath = path.join(this.uploadDir, fileName);
      
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${fileName}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn('File not found during deletion:', filePath);
        return;
      }
      this.logger.error('Failed to delete file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(file);
          this.logger.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old files:', error);
    }
  }
}
