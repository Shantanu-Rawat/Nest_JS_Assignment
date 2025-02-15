import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { DefaultAdminSeeder } from './default-admin.seed';
import { UserRepository } from './users.repository';
import { UnitOfWork } from '../database/unit-of-work';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, DefaultAdminSeeder, UserRepository, UnitOfWork],
  exports: [UsersService]
})
export class UsersModule {}
