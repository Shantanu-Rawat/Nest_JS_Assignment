import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Query,
    BadRequestException,
    HttpStatus,
    Get,
    Param,
    Put,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { FileType } from './dto/file-type.enum';
import { ApiTags, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/jwt/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { eRole } from '../users/dto/role.enum';
import { ConfigService } from '@nestjs/config';

@ApiTags('File Management')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileController {
    constructor(private readonly configService: ConfigService) {}
    
    @Post('upload')
    @Roles(eRole.ADMIN)
    @ApiOperation({ summary: 'Upload a file for a user or organization' })
    @ApiConsumes('multipart/form-data')
    @ApiQuery({ name: 'fileType', enum: FileType, required: true, description: 'Type of file (USER or ORGANIZATION)' })
    @ApiQuery({ name: 'id', required: false, description: 'User ID (required for USER file type)' })
    @ApiBody({
        description: 'File to upload',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request or missing parameters' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const fileType: FileType = req.query.fileType as FileType;
                    const id = req.query.id;

                    if (!fileType) {
                        return cb(new BadRequestException('File type is required'), '');
                    }

                    if (fileType === FileType.USER && !id) {
                        return cb(new BadRequestException('ID is required for user files'), '');
                    }

                    let uploadPath = fileType === FileType.USER
                        ? `./uploads/users/${id}`
                        : `./uploads/organizations`;

                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }

                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
        }),
    )
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('fileType') fileType: FileType,
        @Query('id') id: string,
    ) {
        if (!fileType || (fileType === FileType.USER && !id)) {
            throw new BadRequestException('File type and ID are required for user files');
        }

        // Get base URL from environment variables
        const baseUrl = this.configService.get<string>('BASE_URL');
        const fileUrl = `${baseUrl}/${file.path}`;

        return {
            status: HttpStatus.CREATED,
            message: `File uploaded successfully for ${fileType} with ID ${id}`,
            fileName: file.filename,
            filePath: file.path,
            urL: fileUrl
        };
    }
    
    @Get('list')
    @ApiOperation({ summary: 'List uploaded files for a user or organization' })
    @ApiQuery({ name: 'fileType', enum: FileType, required: true, description: 'Type of file (USER or ORGANIZATION)' })
    @ApiQuery({ name: 'id', required: false, description: 'User ID (required for USER file type)' })
    @ApiResponse({ status: 200, description: 'List of uploaded files' })
    @ApiResponse({ status: 400, description: 'Invalid request or missing parameters' })
    listFiles(
        @Query('fileType') fileType: FileType,
        @Query('id') id: string,
    ) {
        if (!fileType) {
            throw new BadRequestException('File type is required');
        }

        if (fileType === FileType.USER && !id) {
            throw new BadRequestException('ID is required for user files');
        }

        let directoryPath = fileType === FileType.USER
            ? `uploads/users/${id}`
            : `uploads/organizations`;

        if (!fs.existsSync(`./directoryPath`)) {
            return {
                status: HttpStatus.OK,
                message: 'No files found',
                files: [],
            };
        }

        const files = fs.readdirSync(`./directoryPath`);
        const baseUrl = this.configService.get<string>('BASE_URL');
        const fileUrl = `${baseUrl}/${directoryPath}/`;

        return {
            status: HttpStatus.OK,
            message: `Files listed successfully for ${fileType} with ${id ? 'ID ' + id : ''}`,
            files: files.map(file => {
                return {
                    url: `${fileUrl}${file}`,
                    fileName: file
                }
            }),
        };
    }

    @Delete(':fileName')
    @Roles(eRole.ADMIN)
    @ApiOperation({ summary: 'Delete a file for a user or organization' })
    @ApiQuery({ name: 'fileType', enum: FileType, required: true, description: 'Type of file (USER or ORGANIZATION)' })
    @ApiQuery({ name: 'id', required: false, description: 'User ID (required for USER file type)' })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request or file not found' })
    deleteFile(
        @Param('fileName') fileName: string,
        @Query('fileType') fileType: FileType,
        @Query('id') id: string,
    ) {
        if (!fileType) {
            throw new BadRequestException('File type is required');
        }

        if (fileType === FileType.USER && !id) {
            throw new BadRequestException('ID is required for user files');
        }

        let directoryPath = fileType === FileType.USER
            ? `./uploads/users/${id}`
            : `./uploads/organizations`;

        const filePath = path.join(directoryPath, fileName);

        if (!fs.existsSync(filePath)) {
            throw new BadRequestException(`File not found: ${fileName}`);
        }

        fs.unlinkSync(filePath);

        return {
            status: HttpStatus.OK,
            message: `File ${fileName} deleted successfully for ${fileType} with ${id ? 'ID ' + id : ''}`,
        };
    }

    @Put(':fileName')
    @Roles(eRole.ADMIN, eRole.EDITOR)
    @ApiOperation({ summary: 'Update a file for a user or organization' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const fileType: FileType = req.query.fileType as FileType;
                    const id = req.query.id;

                    if (!fileType) {
                        return cb(new BadRequestException('File type is required'), '');
                    }

                    if (fileType === FileType.USER && !id) {
                        return cb(new BadRequestException('ID is required for user files'), '');
                    }

                    let uploadPath = fileType === FileType.USER
                        ? `./uploads/users/${id}`
                        : `./uploads/organizations`;

                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }

                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    // Use the same file name as the original file to replace it
                    cb(null, req.params.fileName);
                },
            }),
        }),
    )
    updateFile(
        @Param('fileName') fileName: string,
        @UploadedFile() file: Express.Multer.File,
        @Query('fileType') fileType: FileType,
        @Query('id') id: string,
    ) {
        if (!fileType || (fileType === FileType.USER && !id)) {
            throw new BadRequestException('File type and ID are required');
        }

        return {
            status: HttpStatus.OK,
            message: `File ${fileName} updated successfully for ${fileType} with ID ${id}`,
        };
    }
}
