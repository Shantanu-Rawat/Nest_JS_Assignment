import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { eRole } from './dto/role.enum';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class DefaultAdminSeeder implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    try {
      // Check if any users exist
      const users = await this.usersService.userList(new UserFilterDto());
      if (users.total === 0) {
        console.log('No users found. Creating a default admin user.');

        // Create default admin user
        const adminUser: CreateUserDto = {
          name: 'Admin',
          email: 'admin@example.com',
          password: 'Admin@123', // Consider hashing this password before storing
          role: eRole.ADMIN,
        };

        await this.usersService.createUser(adminUser);
        console.log('Default admin user created successfully.');
      } else {
        console.log('Users already exist. Skipping default admin creation.');
      }
    } catch (error) {
      console.error('Error creating default admin user:', error);
    }
  }
}
