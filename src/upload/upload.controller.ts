import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  HttpStatus,
  UseFilters,
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
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, gif)',
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
        url: {
          type: 'string',
          description: 'URL of the uploaded file',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid file or no file uploaded' 
  })
  @ApiResponse({ 
    status: HttpStatus.PAYLOAD_TOO_LARGE, 
    description: 'File size exceeds 5MB limit' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNSUPPORTED_MEDIA_TYPE, 
    description: 'Invalid file type' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Server error during upload' 
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Received upload request for file: ${file?.originalname}`);
    const url = await this.uploadService.saveFile(file);
    return { url };
  }
}
