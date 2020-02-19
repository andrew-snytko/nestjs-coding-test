import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOwnerDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    public carId: number;
}
