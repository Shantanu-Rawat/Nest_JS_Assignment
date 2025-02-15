import { HttpStatus } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class ResponseTemplateDto<T> {
  @ApiProperty({ description: 'HTTP status code', enum: HttpStatus })
  status: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  @ApiProperty({ description: 'Error details if any', required: false })
  error?: any;

  constructor(status: HttpStatus, message: string, data?: T, error?: any) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
