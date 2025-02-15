import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { UserInfoDto } from '../users/dto/user-info.dto';
import { UnitOfWork } from '../database/unit-of-work';
import { TokenInfoDto } from './dto/token-info.dto';
import { Transaction } from 'sequelize';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly authRepository: AuthRepository,
        private readonly unitOfWork: UnitOfWork
    ) { }

    async validateUser(email: string, password: string): Promise<UserInfoDto | null> {
        try {
            const user = await this.usersService.validateUser(email, password);
            return user ?? null
        } catch (error) {
            throw error;
        }
    }

    private async generateAuthToken(user: UserInfoDto, transaction: Transaction): Promise<TokenInfoDto> {
        try {
            const payload = { email: user.email, sub: user.id, role: user.role };
            const expiresIn = `${this.configService.get<string>('JWT_EXPIRATION')}s`;
            const accessToken = this.jwtService.sign(payload, { expiresIn });
            const refreshToken = this.jwtService.sign(payload, { expiresIn: `${this.configService.get<string>('REFRESH_TOKEN_EXPIRATION')}s` });
            await this.authRepository.setRefreshToken(refreshToken, user.id, this.getAddedDate(this.configService.get<string>('JWT_EXPIRATION') ?? ''), transaction);
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn
            };
        } catch (error) {
            throw error;
        }
    }

    private getAddedDate(value: string): Date {
        const currentDate = new Date();
        currentDate.setSeconds(currentDate.getSeconds() + parseInt(value));
        return currentDate;
    }

    async login(email: string, password: string): Promise<TokenInfoDto> {
        const transaction = await this.unitOfWork.startTransaction();
        try {
            const user = await this.validateUser(email, password);
            if (!user) {
                throw new BadRequestException('Invalid credentials');
            }
            await this.authRepository.removeRefreshToken(user.id, transaction);
            const tokenInfo = await this.generateAuthToken(user, transaction);
            await transaction.commit(); // Commit the transaction
            return tokenInfo;
        } catch (error) {
            await transaction.rollback(); // Rollback if an error occurs
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<TokenInfoDto> {
        const transaction = await this.unitOfWork.startTransaction();
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.usersService.userById(payload.sub);
            if (!user) {
                throw new BadRequestException('Invalid Credentials');
            }
            const isValid = await this.authRepository.validateRefreshToken(
                user.id,
                refreshToken,
            );
            if (!isValid) {
                throw new BadRequestException('Invalid refresh token');
            }
            await this.authRepository.removeRefreshToken(user.id, transaction);
            const tokenInfo = await this.generateAuthToken(user, transaction);
            await transaction.commit(); // Commit the transaction
            return tokenInfo;
        } catch (error) {
            await transaction.rollback(); // Rollback if an error occurs
            throw error;
        }
    }
}
