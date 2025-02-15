import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';  // Adjust import path accordingly
import { CreateUserDto } from './dto/create-user.dto';
import { Op, Transaction } from 'sequelize';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User) private readonly userModel: typeof User) { }

    async userById(userId: string, transaction?: Transaction): Promise<UserInfoDto> {
        try {
            const userInfo = await this.userModel.findByPk(userId, { transaction });
            if (userInfo)
                return this.mapUserToUserInfo(userInfo)
            throw new BadRequestException('Invalid credentials')
        }
        catch (error) {
            throw error;
        }
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto, transaction: Transaction): Promise<UserInfoDto> {
        try {
            const user = await this.userModel.findByPk(userId, { transaction });
            if (user) {
                await user.update(updateUserDto, { where: { id: userId }, transaction });
                return await this.userById(userId, transaction);
            } else {
                throw new BadRequestException('Invalid credentials');
            }
        } catch (error) {
            throw error;
        }
    }

    async createUser(userData: CreateUserDto, transaction: Transaction): Promise<UserInfoDto> {
        try {
            const userInfo = await this.userModel
                .create({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role,
                    is_active: true
                }, { transaction });
            return this.mapUserToUserInfo(userInfo);
        } catch (error) {
            throw error;
        }
    }

    async userList(filters: UserFilterDto): Promise<UserPaginationDto> {
        try {
            const { name, email, page = 1, limit = 10, sortBy = 'createdAt', order = 'ASC' } = filters;

            const where: any = {};

            if (name) {
                where.name = { [Op.like]: `%${name}%` }; // Partial matching
            }

            if (email) {
                where.email = { [Op.like]: `%${email}%` };
            }
            where.is_active = true;

            const offset = (page - 1) * limit;

            const { rows, count } = await this.userModel.findAndCountAll({
                where,
                limit,
                offset,
                order: [[sortBy, order]],
            });

            return {
                users: rows.map(user => this.mapUserToUserInfo(user)),
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
            };
        } catch (error) {
            throw error;
        }
    }

    async validateUser(filters: UserFilterDto, password: string): Promise<UserInfoDto | null> {
        try {
            const { name, email } = filters;

            const where: any = {};

            if (name) {
                where.name = { [Op.like]: `%${name}%` }; // Partial matching
            }

            if (email) {
                where.email = { [Op.like]: `%${email}%` };
            }
            where.is_active = true;
            const user = await this.userModel.findOne({where});
            if(user && await user.validatePassword(password)){
                return this.mapUserToUserInfo(user);
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    private mapUserToUserInfo(user: User): UserInfoDto {
        const userInfo = new UserInfoDto();
        userInfo.id = user.id;
        userInfo.name = user.name;
        userInfo.email = user.email;
        userInfo.created_at = user.createdAt;
        userInfo.updated_at = user.updatedAt;
        userInfo.role = user.role;
        return userInfo;
    }

}
