import { HttpException, HttpStatus } from '@nestjs/common';

// Authentication & Authorization Exceptions
export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized access') {
    super(
      {
        message,
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Access forbidden') {
    super(
      {
        message,
        error: 'Forbidden',
      },
      HttpStatus.FORBIDDEN
    );
  }
}

// Subscription Exceptions
export class SubscriptionRequiredException extends HttpException {
  constructor(message: string = 'Active subscription required') {
    super(
      {
        message,
        error: 'Subscription Required',
      },
      HttpStatus.PAYMENT_REQUIRED
    );
  }
}

export class SubscriptionVerificationException extends HttpException {
  constructor(message: string = 'Failed to verify subscription status') {
    super(
      {
        message,
        error: 'Subscription Verification Failed',
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}

// Article Exceptions
export class ArticleNotFoundException extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Article with ID ${id} not found`,
        error: 'Article Not Found',
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class ArticleValidationException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Article Validation Error',
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class DuplicateArticleException extends HttpException {
  constructor(message: string = 'Article already exists') {
    super(
      {
        message,
        error: 'Duplicate Article',
      },
      HttpStatus.CONFLICT
    );
  }
}

// File Upload Exceptions
export class FileUploadException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        message,
        error: 'File Upload Error',
      },
      status
    );
  }
}

export class FileNotFoundException extends HttpException {
  constructor(filename: string) {
    super(
      {
        message: `File ${filename} not found`,
        error: 'File Not Found',
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class FileSizeLimitException extends HttpException {
  constructor(maxSize: number) {
    super(
      {
        message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
        error: 'File Size Error',
      },
      HttpStatus.PAYLOAD_TOO_LARGE
    );
  }
}

export class FileTypeException extends HttpException {
  constructor(allowedTypes: string[]) {
    super(
      {
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        error: 'Invalid File Type',
      },
      HttpStatus.UNSUPPORTED_MEDIA_TYPE
    );
  }
}

export class FileSystemException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'File System Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// Database Exceptions
export class DatabaseException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Database Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// Telegram API Exceptions
export class TelegramAPIException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Telegram API Error',
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}

// Rate Limiting Exceptions
export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Too many requests') {
    super(
      {
        message,
        error: 'Rate Limit Exceeded',
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

// Validation Exceptions
export class ValidationException extends HttpException {
  constructor(errors: string[]) {
    super(
      {
        message: errors,
        error: 'Validation Error',
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
