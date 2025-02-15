import { ApiProperty } from '@nestjs/swagger';
import { eRole } from './role.enum';// Import the Role enum
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'The email of the user', example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: eRole,
    example: eRole.VIEWER, // Default example
  })
  @IsEnum(eRole, { message: 'Role must be one of the following: admin, user, moderator' })
  role: eRole;
}
