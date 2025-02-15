import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ResponseTemplateDto } from '../../dto/response/template.dto';
import { TokenInfoDto } from '../dto/token-info.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should log in a user and return token info', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const tokenInfo: TokenInfoDto = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        expires_in: '3600s',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(tokenInfo);

      const response = await authController.login(loginDto);

      expect(response).toEqual(
        new ResponseTemplateDto(200, 'User successfully logged in', tokenInfo),
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should return a 501 response for other errors', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Database error'));

      const response = await authController.login(loginDto);

      expect(response).toEqual(
        new ResponseTemplateDto(501, 'An error occurred while logging in the user', new TokenInfoDto(), new Error('Database error')),
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh the token and return new token info', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'refresh_token' };
      const tokenInfo: TokenInfoDto = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: '3600s',
      };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(tokenInfo);

      const response = await authController.refreshToken(refreshTokenDto);

      expect(response).toEqual(
        new ResponseTemplateDto(200, 'Token successfully refreshed', tokenInfo),
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
    });

    it('should return a 501 response for other errors', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'refresh_token' };
      jest.spyOn(authService, 'refreshToken').mockRejectedValue(new Error('Unexpected error'));

      const response = await authController.refreshToken(refreshTokenDto);

      expect(response).toEqual(
        new ResponseTemplateDto(
          501,
          'An error occurred while refreshing the token',
          new TokenInfoDto(),
          new Error('Unexpected error'),
        ),
      );
    });
  });
});
