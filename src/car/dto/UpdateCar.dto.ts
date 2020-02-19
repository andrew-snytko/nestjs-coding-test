import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class UpdateCarDto {
    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    public manufacturerId?: number;

    @ApiPropertyOptional({ example: '2020-02-18T12:43:42.067Z' })
    @IsDateString()
    @IsOptional()
    public firstRegistrationDate?: string;

    @ApiPropertyOptional({ example: 1000 })
    @IsNumber()
    @IsOptional()
    public price?: number;
}
