import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { eRole } from "./role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto{
    @ApiProperty({ description: 'The name of the user' })
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    name?: string;

    @ApiProperty({ description: 'The email of the user', example: 'john@example.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @ApiProperty({ description: 'The password of the user' })
    @IsOptional()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @ApiProperty({
      description: 'The role of the user',
      enum: eRole,
      example: eRole.VIEWER, // Default example
    })
    @IsOptional()
    @IsEnum(eRole, { message: 'Role must be one of the following: admin, user, moderator' })
    role?: eRole;
}