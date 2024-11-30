import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 } from 'uuid';
import {
  FileUploadException,
  FileNotFoundException,
  FileSizeLimitException,
  FileTypeException,
  FileSystemException,
} from '../common/exceptions/custom.exceptions';

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
      throw new FileSystemException('Failed to initialize upload system');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new FileUploadException('No file provided', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Processing upload: ${file.originalname}`);
      
      // Validate file
      await this.validateFile(file);

      // Generate a unique filename with original extension
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${v4()}${extension}`;
      const filePath = path.join(this.uploadDir, fileName);

      try {
        // Save the file
        await fs.writeFile(filePath, file.buffer);
        this.logger.log(`File saved: ${fileName}`);

        // Verify the file was written correctly
        const stats = await fs.stat(filePath);
        if (stats.size !== file.buffer.length) {
          this.logger.error(`File verification failed for ${fileName}`);
          await this.deleteFile(fileName);
          throw new FileSystemException('File verification failed');
        }
      } catch (writeError) {
        this.logger.error(`Failed to write file: ${writeError.message}`);
        throw new FileSystemException('Failed to save file to disk');
      }

      const baseUrl = process.env.BASE_URL || 'https://legitcommunity.uz';
      return `${baseUrl}/upload/${fileName}`;
    } catch (error) {
      if (error instanceof FileUploadException ||
          error instanceof FileSizeLimitException ||
          error instanceof FileTypeException ||
          error instanceof FileSystemException) {
        throw error;
      }
      
      this.logger.error(`Unexpected error during file upload: ${error.message}`, error.stack);
      throw new FileUploadException(
        'Failed to process file upload',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file.buffer) {
      throw new FileUploadException('File content is missing');
    }

    if (file.size > this.maxFileSize) {
      throw new FileSizeLimitException(this.maxFileSize);
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new FileTypeException(this.allowedExtensions);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new FileTypeException(['image/jpeg', 'image/png', 'image/gif']);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileName = filePath.startsWith('/upload/') 
        ? filePath.slice(8) 
        : path.basename(filePath);

      const fullPath = path.join(this.uploadDir, fileName);
      
      try {
        await fs.access(fullPath);
      } catch {
        throw new FileNotFoundException(fileName);
      }

      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${fileName}`);
    } catch (error) {
      if (error instanceof FileNotFoundException) {
        throw error;
      }
      
      this.logger.error('Failed to delete file:', error);
      throw new FileSystemException('Failed to delete file');
    }
  }

  async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const now = Date.now();

      for (const file of files) {
        try {
          const filePath = path.join(this.uploadDir, file);
          const stats = await fs.stat(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            await this.deleteFile(file);
            this.logger.log(`Cleaned up old file: ${file}`);
          }
        } catch (error) {
          // Log but continue with other files
          this.logger.error(`Failed to process file during cleanup: ${file}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old files:', error);
      // Don't throw as this is a background task
    }
  }
}
