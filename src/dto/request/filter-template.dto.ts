import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class RequestFilterDto{
    @ApiProperty({ description: 'The page number of the pagination', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    page?: number;
  
    @ApiProperty({ description: 'The limit of data of the pagination', required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;
    
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC';
    
}