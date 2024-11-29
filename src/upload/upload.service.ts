import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises'; // Using promises for non-blocking operations
import * as path from 'path';
import { v4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(__dirname, '..', '..', 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

  constructor() {
    // Ensure the upload directory exists during service initialization
    this.initializeUploadDirectory();
  }

  private async initializeUploadDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
      throw new InternalServerErrorException('Failed to initialize upload system');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      // Validate file
      await this.validateFile(file);

      // Generate a unique filename with original extension
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${v4()}${extension}`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save the file
      await fs.writeFile(filePath, file.buffer);

      // Verify the file was written correctly
      const stats = await fs.stat(filePath);
      if (stats.size !== file.buffer.length) {
        await this.deleteFile(fileName);
        throw new Error('File verification failed');
      }

      return `/upload/${fileName}`;
    } catch (error) {
      console.error('Error saving file:', error);
      if (error.message === 'File verification failed') {
        throw new InternalServerErrorException('Failed to save file: verification error');
      }
      throw new InternalServerErrorException('Failed to save file');
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    // Check if file exists
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }

    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`);
    }

    // Check if file is actually an image
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Invalid file type: file must be an image');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Extract filename from path
      const fileName = filePath.startsWith('/upload/') 
        ? filePath.slice(8) 
        : path.basename(filePath);

      const fullPath = path.join(this.uploadDir, fileName);

      // Check if file exists before attempting to delete
      await fs.access(fullPath);
      await fs.unlink(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, just log it
        console.warn('File not found during deletion:', filePath);
        return;
      }
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async cleanupOldFiles(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(file);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      // Don't throw error as this is a maintenance operation
    }
  }
}
