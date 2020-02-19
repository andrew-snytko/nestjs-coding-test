import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCarDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    public manufacturerId: number;

    @ApiProperty({ example: '2020-02-18T12:43:42.067Z' })
    @IsDateString()
    @IsNotEmpty()
    public firstRegistrationDate: string;

    @ApiProperty({ example: 1000 })
    @IsNumber()
    @IsNotEmpty()
    public price: number;
}
