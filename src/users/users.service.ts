import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './users.repository';
import { UnitOfWork } from '../database/unit-of-work';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly unitOfWork: UnitOfWork,) { }

  async createUser(userData: CreateUserDto): Promise<UserInfoDto> {
    const transaction = await this.unitOfWork.startTransaction();
    try {
      const userInfo = await this.userRepository.createUser(userData, transaction);
      await transaction.commit(); // Commit the transaction
      return userInfo;
    } catch (error) {
      await transaction.rollback(); // Rollback if an error occurs
      throw error;
    }
  }

  async userList(filters: UserFilterDto): Promise<UserPaginationDto> {
    try {
      return await this.userRepository.userList(filters);
    } catch (error) {
      throw error;
    }
  }

  async userById(id: string): Promise<UserInfoDto> {
    try {
      return await this.userRepository.userById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<UserInfoDto> {
    const transaction = await this.unitOfWork.startTransaction();
    try {
      const updateQuery = new UpdateUserDto();
      updateQuery.is_active = false;
      const userInfo = await this.userRepository.updateUser(id, updateQuery, transaction);
      await transaction.commit(); // Commit the transaction
      return userInfo;
    } catch (error) {
      await transaction.rollback(); // Rollback if an error occurs
      throw error;
    }
  }

  async deleteUser(id: string): Promise<string> {
    const transaction = await this.unitOfWork.startTransaction();
    try {
      const user = await this.userRepository.userById(id);
      if (!user) {
        throw new NotFoundException('Invalid Credentials');
      }
      const updateQuery = new UpdateUserDto();
      updateQuery.is_active = false;
      await this.userRepository.updateUser(id, updateQuery, transaction);
      await transaction.commit(); // Commit the transaction
      return 'User deleted successfully'
    } catch (error) {
      await transaction.rollback(); // Rollback if an error occurs
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<UserInfoDto> {
    try {
      const filers = new UserFilterDto();
      filers.email = email;
      const userInfo = await this.userRepository.validateUser(filers, password)
      if (userInfo)
        return userInfo;
      return new UserInfoDto();
    } catch (error) {
      throw error;
    }
  }
}
