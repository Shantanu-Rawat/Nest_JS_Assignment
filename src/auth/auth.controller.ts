import {
    Controller,
    Post,
    Body,
    BadRequestException,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
  import { LoginDto } from './dto/login.dto';
  import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseTemplateDto } from '../dto/response/template.dto';
import { TokenInfoDto } from './dto/token-info.dto';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('login')
    @ApiOperation({ summary: 'Log in a user' })
    @ApiResponse({
      status: 201,
      description: 'User successfully logged in',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseTemplateDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(TokenInfoDto) },
            },
          },
        ],
      },
    })
    @ApiResponse({
      status: 400,
      description: 'Invalid credentials',
    })
    @ApiResponse({
      status: 501,
      description: 'An error occurred during login',
    })
    async login(@Body() body: LoginDto): Promise<ResponseTemplateDto<TokenInfoDto>> {
      try {
        const tokenInfo = await this.authService.login(body.email, body.password);
        return new ResponseTemplateDto(200, "User successfully logged in", tokenInfo);
      } catch (error) {
        console.error(error);
        if (error instanceof BadRequestException) {
          throw new ResponseTemplateDto(400, error.message, new TokenInfoDto());
        }
        return new ResponseTemplateDto(501, "An error occurred while logging in the user", new TokenInfoDto(), error);
      }
    }
  
    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh the access token' })
    @ApiResponse({
      status: 201,
      description: 'Token successfully refreshed', 
      type: ResponseTemplateDto<TokenInfoDto>
    })
    @ApiResponse({
      status: 400,
      description: 'Invalid refresh token || Invalid Credentials',
    })
    @ApiResponse({
      status: 501,
      description: 'An error occurred during token refresh',
    })
    async refreshToken(@Body() body: RefreshTokenDto): Promise<ResponseTemplateDto<TokenInfoDto>> {
      try {
        const tokenInfo = await this.authService.refreshToken(body.refresh_token);
        return new ResponseTemplateDto(200, "Token successfully refreshed", tokenInfo);
      } catch (error) {
        console.error(error);
        if (error instanceof BadRequestException) {
          throw new ResponseTemplateDto(400, error.message, new TokenInfoDto());
        }
        return new ResponseTemplateDto(501, "An error occurred while refreshing the token", new TokenInfoDto(), error);
      }
    }
  }
  