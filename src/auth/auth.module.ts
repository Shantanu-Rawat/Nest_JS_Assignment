import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './jwt/local.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshToken } from './models/refresh-token.model';
import { AuthRepository } from './auth.repository';
import { UnitOfWork } from '../database/unit-of-work';

@Module({
  imports: [
    UsersModule, // Ensure UsersModule is available
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
    SequelizeModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '3600s'), // Optional expiration setting
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthRepository, UnitOfWork],
  controllers: [AuthController],
})
export class AuthModule {}
