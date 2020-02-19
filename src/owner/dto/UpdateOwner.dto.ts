import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOwnerDto {
    @ApiPropertyOptional({ example: 'John' })
    @IsString()
    @IsOptional()
    public name?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    public carId?: number;
}
