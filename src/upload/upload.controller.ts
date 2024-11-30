import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  HttpStatus,
  UseFilters,
  BadRequestException,
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
import { HttpExceptionFilter } from '../common/exceptions/http-exception.filter';
import { FileUploadException } from '../common/exceptions/custom.exceptions';

@ApiTags('Upload')
@Controller('upload')
@UseFilters(HttpExceptionFilter)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload (max 5MB)',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, gif, webp)',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the uploaded file',
        },
        path: {
          type: 'string',
          description: 'Path to access the file',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid file upload request',
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      this.logger.error('File upload failed: No file provided');
      throw new BadRequestException('File content is missing');
    }

    try {
      const result = await this.uploadService.processUploadedFile(file);
      this.logger.log(`File uploaded successfully: ${result.filename}`);
      return result;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new FileUploadException(error.message);
    }
  }
}
