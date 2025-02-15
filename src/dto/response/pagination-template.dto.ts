import { ApiProperty } from '@nestjs/swagger';

export class ResponsePaginationTemplateDto {
  @ApiProperty({
    description: 'Total number of items available',
    example: 200,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}
