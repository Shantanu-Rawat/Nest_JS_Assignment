import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserRepository } from '../users.repository';
import { NotFoundException } from '@nestjs/common';
import { UnitOfWork } from '../../database/unit-of-work';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { UserPaginationDto } from '../dto/user-pagination.dto';
import { UserInfoDto } from '../dto/user-info.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let unitOfWork: UnitOfWork;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            userList: jest.fn(),
            userById: jest.fn(),
            updateUser: jest.fn(),
            validateUser: jest.fn(),
          },
        },
        {
          provide: UnitOfWork,
          useValue: {
            startTransaction: jest.fn().mockReturnValue({
              commit: jest.fn(),
              rollback: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    unitOfWork = module.get<UnitOfWork>(UnitOfWork);
  });

  describe('createUser', () => {
    it('should create a user and commit the transaction', async () => {
      const userData = new CreateUserDto();
      const userInfo = new UserInfoDto();
      jest.spyOn(userRepository, 'createUser').mockResolvedValue(userInfo);

      const result = await service.createUser(userData);

      expect(result).toBe(userInfo);
      expect((await unitOfWork.startTransaction()).commit).toHaveBeenCalled();
    });

    it('should rollback the transaction if an error occurs', async () => {
      const userData = new CreateUserDto();
      jest.spyOn(userRepository, 'createUser').mockRejectedValue(new Error('Error'));

      await expect(service.createUser(userData)).rejects.toThrow('Error');
      expect((await unitOfWork.startTransaction()).rollback).toHaveBeenCalled();
    });
  });

  describe('userList', () => {
    it('should return a list of users', async () => {
      const filters = new UserFilterDto();
      const userPagination = new UserPaginationDto();
      jest.spyOn(userRepository, 'userList').mockResolvedValue(userPagination);

      const result = await service.userList(filters);

      expect(result).toBe(userPagination);
    });
  });

  describe('userById', () => {
    it('should return a user by id', async () => {
      const userInfo = new UserInfoDto();
      jest.spyOn(userRepository, 'userById').mockResolvedValue(userInfo);

      const result = await service.userById('1');

      expect(result).toBe(userInfo);
    });
  });

  describe('updateUser', () => {
    it('should update a user and commit the transaction', async () => {
      const userInfo = new UserInfoDto();
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue(userInfo);

      const result = await service.updateUser('1', new UpdateUserDto());

      expect(result).toBe(userInfo);
      expect((await unitOfWork.startTransaction()).commit).toHaveBeenCalled();
    });

    it('should rollback the transaction if an error occurs', async () => {
      jest.spyOn(userRepository, 'updateUser').mockRejectedValue(new Error('Error'));

      await expect(service.updateUser('1', new UpdateUserDto())).rejects.toThrow('Error');
      expect((await unitOfWork.startTransaction()).rollback).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and commit the transaction', async () => {
      const userInfo = new UserInfoDto();
      jest.spyOn(userRepository, 'userById').mockResolvedValue(userInfo);
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue(userInfo);

      const result = await service.deleteUser('1');

      expect(result).toBe('User deleted successfully');
      expect((await unitOfWork.startTransaction()).commit).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user info if credentials are valid', async () => {
      const userInfo = new UserInfoDto();
      jest.spyOn(userRepository, 'validateUser').mockResolvedValue(userInfo);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBe(userInfo);
    });

    it('should return an empty UserInfoDto if credentials are invalid', async () => {
      jest.spyOn(userRepository, 'validateUser').mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(new UserInfoDto());
    });
  });
});
