import { ApiResponseProperty } from '@nestjs/swagger';

export class CarDto {
    @ApiResponseProperty({ example: 1 })
    public id: number;

    @ApiResponseProperty({ example: 1000 })
    public price: number;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public firstRegistrationDate: string;

    @ApiResponseProperty({ example: 20 })
    public discountPercent: number;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public updatedAt: string;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public createdAt: string;
}
