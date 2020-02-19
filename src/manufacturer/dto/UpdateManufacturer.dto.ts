import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateManufacturerDto {
    @ApiPropertyOptional({ example: 'Audi' })
    @IsString()
    @IsOptional()
    public name?: string;

    @ApiPropertyOptional({ example: '000-00-00' })
    @IsString()
    @IsOptional()
    public phone?: string;

    @ApiPropertyOptional({ example: 12345 })
    @IsNumber()
    @IsOptional()
    public siret?: number;
}
