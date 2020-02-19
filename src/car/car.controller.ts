import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ManufacturerDto } from '../manufacturer/dto';
import { NOT_FOUND_MESSAGE } from './car.constants';
import { CarService } from './car.service';
import { CarDto, CreateCarDto, UpdateCarDto } from './dto';

@Controller('cars')
@ApiTags('cars')
export class CarController {
    constructor(private readonly carService: CarService) {}

    @Get()
    public async findAll(): Promise<CarDto[]> {
        const cars = await this.carService.findAll();

        return cars.map(car => CarService.getDto(car));
    }

    @Get(':id')
    public async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<CarDto> {
        const car = await this.carService.findById(id);

        if (!car) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        return CarService.getDto(car);
    }

    @Post()
    public async create(@Body() payload: CreateCarDto): Promise<CarDto> {
        const car = await this.carService.create(payload);

        return CarService.getDto(car);
    }

    @Patch(':id')
    public async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateCarDto,
    ): Promise<CarDto> {
        const car = await this.carService.update({
            id,
            payload,
        });

        return CarService.getDto(car);
    }

    @HttpCode(204)
    @Delete(':id')
    public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.carService.delete(id);
    }

    @Get(':id/manufacturer')
    public async getCarManufacturer(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ManufacturerDto> {
        return this.carService.getManufacturer(id);
    }
}
