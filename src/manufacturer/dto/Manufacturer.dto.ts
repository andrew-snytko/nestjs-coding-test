import { ApiResponseProperty } from '@nestjs/swagger';

export class ManufacturerDto {
    @ApiResponseProperty({ example: 1 })
    public id: number;

    @ApiResponseProperty({ example: 'Audi' })
    public name: string;

    @ApiResponseProperty({ example: '000-00-00' })
    public phone: string;

    @ApiResponseProperty({ example: 12345 })
    public siret: number;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public updatedAt: string;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public createdAt: string;
}
