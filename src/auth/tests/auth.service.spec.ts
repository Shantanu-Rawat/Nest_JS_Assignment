import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { AuthRepository } from '../auth.repository';
import { UnitOfWork } from '../../database/unit-of-work';
import { eRole } from '../../users/dto/role.enum';
import { UserInfoDto } from '../../users/dto/user-info.dto';
import { Transaction } from 'sequelize';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let authRepository: AuthRepository;
  let unitOfWork: UnitOfWork;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUser: jest.fn(),
            userById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('3600'),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            setRefreshToken: jest.fn(),
            removeRefreshToken: jest.fn(),
            validateRefreshToken: jest.fn(),
          },
        },
        {
          provide: UnitOfWork,
          useValue: {
            startTransaction: jest.fn().mockResolvedValue({
              commit: jest.fn(),
              rollback: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    unitOfWork = module.get<UnitOfWork>(UnitOfWork);
  });

  describe('validateUser', () => {
    it('should return a user if validation is successful', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: eRole.VIEWER, name: 'test', created_at: new Date(), updated_at: new Date() };
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);

      const result = await authService.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return token information if credentials are valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: eRole.VIEWER, name: 'test', created_at: new Date(), updated_at: new Date() };
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
        afterCommit: jest.fn(),
        LOCK: jest.fn(), // Add necessary Sequelize Transaction methods
      } as unknown as Transaction;
      
      jest.spyOn(unitOfWork, 'startTransaction').mockResolvedValue(mockTransaction);
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'removeRefreshToken').mockResolvedValue(undefined);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      const result = await authService.login('test@example.com', 'password');
      expect(result).toEqual({
        access_token: 'mockAccessToken',
        refresh_token: 'mockAccessToken',
        expires_in: '3600s',
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return new token information if the refresh token is valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: eRole.VIEWER, name: 'test', created_at: new Date(), updated_at: new Date() };
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
        afterCommit: jest.fn(),
        LOCK: jest.fn(), // Add necessary Sequelize Transaction methods
      } as unknown as Transaction;
      
      jest.spyOn(unitOfWork, 'startTransaction').mockResolvedValue(mockTransaction);
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: '1' });
      jest.spyOn(usersService, 'userById').mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'validateRefreshToken').mockResolvedValue(true);
      jest.spyOn(authRepository, 'removeRefreshToken').mockResolvedValue(undefined);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      const result = await authService.refreshToken('mockRefreshToken');
      expect(result).toEqual({
        access_token: 'mockAccessToken',
        refresh_token: 'mockAccessToken',
        expires_in: '3600s',
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw an error if the refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: '1' });
      jest.spyOn(usersService, 'userById').mockResolvedValue(new UserInfoDto());
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
        afterCommit: jest.fn(),
        LOCK: jest.fn(), // Add necessary Sequelize Transaction methods
      } as unknown as Transaction;
      
      jest.spyOn(unitOfWork, 'startTransaction').mockResolvedValue(mockTransaction);

      await expect(authService.refreshToken('invalidToken')).rejects.toThrow(BadRequestException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
