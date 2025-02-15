import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ResponseTemplateDto } from '../../dto/response/template.dto';
import { UserPaginationDto } from '../dto/user-pagination.dto';
import { UserInfoDto } from '../dto/user-info.dto';
import { eRole } from '../dto/role.enum';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    createUser: jest.fn(),
    userList: jest.fn(),
    userById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user and return success response', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'test', role: eRole.VIEWER };
      const userInfo: UserInfoDto = { id: '1', name: 'test', email: 'test@example.com', updated_at: new Date(), created_at: new Date(), role: eRole.VIEWER };
      mockUsersService.createUser.mockResolvedValue(userInfo);

      const result = await controller.create(createUserDto);

      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(new ResponseTemplateDto(201, 'User successfully created', userInfo));
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const userPagination: UserPaginationDto = { 
        total: 1,
        users: [
          { 
            id: '1',
            name: 'test',
            email: 'test@example.com',
            updated_at: new Date(),
            created_at: new Date(), 
            role: eRole.VIEWER 
          }
        ],
        page: 1,
        totalPages: 1
      };
      mockUsersService.userList.mockResolvedValue(userPagination);

      const result = await controller.findAll({});

      expect(service.userList).toHaveBeenCalled();
      expect(result).toEqual(new ResponseTemplateDto(200, 'Paginated list of Users', userPagination));
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const userInfo: UserInfoDto ={ 
        id: '1',
        name: 'test',
        email: 'test@example.com',
        updated_at: new Date(),
        created_at: new Date(), 
        role: eRole.VIEWER 
      };
      mockUsersService.userById.mockResolvedValue(userInfo);

      const result = await controller.findOne('1');

      expect(service.userById).toHaveBeenCalledWith('1');
      expect(result).toEqual(new ResponseTemplateDto(200, 'User Retrieved Successfully', userInfo));
    });
  });

  describe('update', () => {
    it('should update a user and return success response', async () => {
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };
      const updatedUserInfo: UserInfoDto = { 
        id: '1',
        name: 'test',
        email: 'test@example.com',
        updated_at: new Date(),
        created_at: new Date(), 
        role: eRole.VIEWER 
      };
      mockUsersService.updateUser.mockResolvedValue(updatedUserInfo);

      const result = await controller.update('1', updateUserDto);

      expect(service.updateUser).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(new ResponseTemplateDto(200, 'User updated successfully', updatedUserInfo));
    });
  });

  describe('delete', () => {
    it('should delete a user and return success response', async () => {
      mockUsersService.deleteUser.mockResolvedValue('User deleted successfully');

      const result = await controller.delete('1');

      expect(service.deleteUser).toHaveBeenCalledWith('1');
      expect(result).toEqual(new ResponseTemplateDto(200, 'User deleted successfully', 'User deleted successfully'));
    });
  });
});
