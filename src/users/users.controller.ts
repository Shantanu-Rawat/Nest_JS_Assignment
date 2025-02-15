import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { UserInfoDto } from './dto/user-info.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseTemplateDto } from '../dto/response/template.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/jwt/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { eRole } from './dto/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles(eRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201, description: 'User successfully created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseTemplateDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserInfoDto) },
          },
        },
      ],
    },
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseTemplateDto<UserInfoDto>> {
    try {
      const userInfo = await this.usersService.createUser(createUserDto);
      return new ResponseTemplateDto(201, "User successfully created", userInfo);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return new ResponseTemplateDto(400, "Email already exists", new UserInfoDto());
      }
      return new ResponseTemplateDto(501, "An error occurred while creating the user", new UserInfoDto(), error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200, description: 'Paginated list of users',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseTemplateDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserPaginationDto) },
          },
        },
      ],
    },
  })
  async findAll(@Param() filters: UserFilterDto): Promise<ResponseTemplateDto<UserPaginationDto>> {
    try {
      const userList = await this.usersService.userList(filters);
      return new ResponseTemplateDto(200, "Paginated list of Users", userList);
    } catch (error) {
      console.error('Error retrieving users:', error);
      return new ResponseTemplateDto(501, "An error occurred while retrieving users", new UserPaginationDto(), error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({
    status: 200, description: 'User retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseTemplateDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserInfoDto) },
          },
        },
      ],
    },
  })
  async findOne(@Param('id') id: string): Promise<ResponseTemplateDto<UserInfoDto>> {
    try {
      const userInfo = await this.usersService.userById(id);
      return new ResponseTemplateDto(200, "User Retrieved Successfully", userInfo);
    } catch (error) {
      console.error(`Error retrieving user with ID ${id}:`, error); UserInfoDto
      if (error instanceof BadRequestException) {
        return new ResponseTemplateDto(400, error.message, new UserInfoDto());
      }
      return new ResponseTemplateDto(501, "An error occurred while retrieving the user", new UserInfoDto(), error);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({
    status: 200, description: 'User updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseTemplateDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserInfoDto) },
          },
        },
      ],
    },
  })
  @Roles(eRole.ADMIN, eRole.EDITOR)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ResponseTemplateDto<UserInfoDto>> {
    try {
      const userInfo = await this.usersService.updateUser(id, updateUserDto);
      return new ResponseTemplateDto(200, "User updated successfully", userInfo);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      if (error instanceof BadRequestException) {
        return new ResponseTemplateDto(400, error.message, new UserInfoDto());
      }
      return new ResponseTemplateDto(501, "An error occurred while updating the user", new UserInfoDto(), error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({
    status: 200, description: 'User deleted successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseTemplateDto) },
        {
          properties: {
            data: { type: 'string' },
          },
        },
      ],
    },
  })
  @Roles(eRole.ADMIN)
  async delete(@Param('id') id: string): Promise<ResponseTemplateDto<string>> {
    try {
      const successString = await this.usersService.deleteUser(id);
      return new ResponseTemplateDto(200, "User deleted successfully", successString)
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      return new ResponseTemplateDto(501, "AAn error occurred while deleting the user", '', error);
    }
  }
}
