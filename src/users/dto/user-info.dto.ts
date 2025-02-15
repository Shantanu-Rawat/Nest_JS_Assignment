import { ApiProperty } from '@nestjs/swagger';
import { eRole } from './role.enum';

export class UserInfoDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Date and time when the user was created',
    example: '2025-02-14T12:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date and time when the user was last updated',
    example: '2025-02-14T12:30:00.000Z',
  })
  updated_at: Date;


  @ApiProperty({
    description: 'The role of the user',
    enum: eRole,
    example: eRole.VIEWER, // Default example
  })
  role: eRole;
}
