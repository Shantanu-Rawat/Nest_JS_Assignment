import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ResponseTemplateDto } from './dto/response/template.dto';
import { UserInfoDto } from './users/dto/user-info.dto';
import { TokenInfoDto } from './auth/dto/token-info.dto';
import { UserPaginationDto } from './users/dto/user-pagination.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Ensure all models are synced with the database
  const sequelize = app.get(Sequelize);
  await sequelize.sync({ alter: true }); // `alter: true` ensures database schema updates

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NestJS Assginment API')
    .setDescription('API documentation for the NestJS Assginment project')
    .setVersion('1.0')
    .addBearerAuth() // Add support for Bearer token auth if needed
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ResponseTemplateDto, UserInfoDto, TokenInfoDto, UserPaginationDto],
  });
  SwaggerModule.setup('api-docs', app, document); // Swagger UI will be available at http://localhost:3000/api-docs

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  // Get the port from ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
}
bootstrap();
