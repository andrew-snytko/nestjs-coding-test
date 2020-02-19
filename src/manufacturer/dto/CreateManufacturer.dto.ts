import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateManufacturerDto {
    @ApiProperty({ example: 'Audi' })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({ example: '000-00-00' })
    @IsString()
    @IsNotEmpty()
    public phone: string;

    @ApiProperty({ example: 12345 })
    @IsNumber()
    @IsNotEmpty()
    public siret: number;
}
