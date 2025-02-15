import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { FileType } from './dto/file-type.enum';

jest.mock('fs');

describe('FileController', () => {
  let controller: FileController;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BASE_URL') return 'http://localhost:3000';
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      filename: 'test-file.txt',
      path: 'uploads/users/123/test-file.txt',
    } as any;
    it('should return upload success message with file URL', () => {
      const response = controller.uploadFile(mockFile, 'USER' as any, '123');
      expect(response).toEqual({
        status: 201,
        message: 'File uploaded successfully for USER with ID 123',
        fileName: 'test-file.txt',
        filePath: 'uploads/users/123/test-file.txt',
        urL: 'http://localhost:3000/uploads/users/123/test-file.txt',
      });
    });
  });

  describe('listFiles', () => {
    it('should return an empty list if no files are found', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const response = controller.listFiles('USER' as any, '123');
      expect(response).toEqual({
        status: 200,
        message: 'No files found',
        files: [],
      });
    });
    it('should return a list of files', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['file1.txt', 'file2.txt']);

      const response = controller.listFiles('ORGANIZATION' as any, '');
      expect(response).toEqual({
        status: 200,
        message: 'Files listed successfully for ORGANIZATION with ',
        files: [
          { url: 'http://localhost:3000/uploads/organizations/file1.txt', fileName: 'file1.txt' },
          { url: 'http://localhost:3000/uploads/organizations/file2.txt', fileName: 'file2.txt' },
        ],
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete the file successfully', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => { });

      const response = controller.deleteFile('test.txt', 'USER' as any, '123');
      expect(response).toEqual({
        status: 200,
        message: 'File test.txt deleted successfully for USER with ID 123',
      });
    });
  });
});
