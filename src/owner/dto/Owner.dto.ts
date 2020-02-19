import { ApiResponseProperty } from '@nestjs/swagger';

export class OwnerDto {
    @ApiResponseProperty({ example: 1 })
    public id: number;

    @ApiResponseProperty({ example: 'John' })
    public name: string;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public purchaseDate: string;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public updatedAt: string;

    @ApiResponseProperty({ example: '2020-02-18T12:43:42.067Z' })
    public createdAt: string;
}
