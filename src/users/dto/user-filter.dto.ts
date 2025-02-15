import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { RequestFilterDto } from '../../dto/request/filter-template.dto';

export class UserFilterDto extends RequestFilterDto {
  @ApiProperty({ description: 'The name of the user', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The email of the user', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'email', 'createdAt', 'updatedAt'])
  sortBy?: string;
}
