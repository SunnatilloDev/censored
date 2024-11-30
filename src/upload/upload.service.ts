import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {
  FileUploadException,
  FileSizeLimitException,
  FileTypeException,
} from '../common/exceptions/custom.exceptions';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
  ];
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  constructor() {
    this.initializeUploadDirectory();
  }

  private initializeUploadDirectory() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      this.logger.log(`Upload directory initialized at: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error('Failed to initialize upload directory:', error);
      throw new FileUploadException('Failed to initialize upload directory');
    }
  }

  async processUploadedFile(file: Express.Multer.File) {
    if (!file) {
      throw new FileUploadException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new FileSizeLimitException(this.maxFileSize);
    }

    // Validate file type
    const extension = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new FileTypeException(this.allowedExtensions);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new FileTypeException(this.allowedMimeTypes);
    }

    try {
      // File is already saved by Multer, just return the info
      const relativePath = path.relative(process.cwd(), file.path);

      return {
        filename: file.filename,
        path: `/${relativePath.replace(/\\/g, '/')}`,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error('Failed to process uploaded file:', error);
      throw new FileUploadException('Failed to process uploaded file');
    }
  }

  async deleteFile(filename: string) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`File deleted: ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${filename}:`, error);
      throw new FileUploadException(`Failed to delete file: ${filename}`);
    }
  }
}
