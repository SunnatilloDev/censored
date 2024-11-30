import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Express } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or no file uploaded' })
  @ApiResponse({ status: 500, description: 'Server error during upload' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.logger.log(`Attempting to upload file: ${file.originalname}`);
      const result = await this.uploadService.saveFile(file);
      this.logger.log(`Successfully uploaded file: ${result}`);
      
      return { url: result };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.message.includes('Only image files are allowed')) {
        throw new BadRequestException('Only image files are allowed');
      }
      
      if (error.message.includes('File size exceeds')) {
        throw new BadRequestException('File size exceeds 5MB limit');
      }
      
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
