import { InjectModel } from "@nestjs/sequelize";
import { RefreshToken } from "./models/refresh-token.model";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Transaction } from "sequelize";

@Injectable()
export class AuthRepository {
    constructor(@InjectModel(RefreshToken) private readonly refreshTokenModel: typeof RefreshToken) { }

    async setRefreshToken(token: string, userId: string, expiresAt: Date, transaction: Transaction): Promise<void> {
        try {
            await this.refreshTokenModel.create({ token, userId, expiresAt, is_active: true }, { transaction });
        } catch (error) {
            throw error;
        }
    }

    async removeRefreshToken(userId: string, transaction: Transaction): Promise<void> {
        try {
            await this.refreshTokenModel.update({ is_active: false }, { where: { userId: userId }, transaction })
        } catch (error) {
            throw error;
        }
    }

    async validateRefreshToken(userId: string, token: string): Promise<boolean> {
        try {
            const refreshToken = await RefreshToken.findOne({ where: { token, userId, is_active: true } });
            if (!refreshToken || refreshToken.expiresAt < new Date()) {
                throw new BadRequestException('Invalid or expired refresh token');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}