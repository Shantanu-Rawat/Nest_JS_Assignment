import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // Serve files from the "uploads" directory
      serveRoot: '/uploads',
    }),
  ],
  controllers: [FileController]
})
export class FileModule {}
