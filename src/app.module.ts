import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Makes ConfigModule available globally across the application
    envFilePath: '.env', // Loads environment variables from the .env file
  }), UsersModule, DatabaseModule, AuthModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }