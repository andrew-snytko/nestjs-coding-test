import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManufacturerDto } from '../manufacturer/dto';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { getMonthDiff } from '../shared/utils';
import {
    MISSING_MANUFACTURER_MESSAGE,
    NOT_FOUND_MESSAGE,
} from './car.constants';
import { Car } from './car.entity';
import { IUpdateCar } from './car.interface';
import { CarDto, CreateCarDto } from './dto';

@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepo: Repository<Car>,
        private readonly manufacturerService: ManufacturerService,
    ) {}

    public async findAll(): Promise<Car[]> {
        try {
            return await this.carRepo.find();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async findById(id: number): Promise<Car | undefined> {
        try {
            return await this.carRepo.findOne(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async create(payload: CreateCarDto): Promise<Car> {
        const { manufacturerId } = payload;
        const manufacturer = await this.manufacturerService.findById(
            manufacturerId,
        );

        if (!manufacturer) {
            throw new NotFoundException(MISSING_MANUFACTURER_MESSAGE);
        }

        try {
            const car = this.carRepo.create({
                ...payload,
                firstRegistrationDate: new Date(payload.firstRegistrationDate),
                manufacturer,
            });

            return await this.carRepo.save(car);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async update(data: IUpdateCar): Promise<Car> {
        const { id, payload } = data;
        const { manufacturerId, firstRegistrationDate } = payload;
        let carToUpdate: Car;

        const car = await this.findById(id);

        if (!car) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            carToUpdate = this.carRepo.merge(car, {
                ...payload,
                firstRegistrationDate: firstRegistrationDate
                    ? new Date(firstRegistrationDate)
                    : car.firstRegistrationDate,
            });
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }

        if (typeof manufacturerId !== 'undefined') {
            const manufacturer = await this.manufacturerService.findById(
                manufacturerId,
            );

            if (!manufacturer) {
                throw new NotFoundException(MISSING_MANUFACTURER_MESSAGE);
            }

            carToUpdate.manufacturer = manufacturer;
        }

        try {
            return await this.carRepo.save(carToUpdate);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async delete(id: number): Promise<void> {
        const car = await this.findById(id);

        if (!car) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            await this.carRepo.delete(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async getManufacturer(carId: number): Promise<ManufacturerDto> {
        const car = await this.carRepo.findOne(carId, {
            relations: ['manufacturer'],
        });

        if (!car) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            const manufacturer = ManufacturerService.getDto(car.manufacturer);

            return manufacturer;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async applyDiscount(): Promise<void> {
        const cars = await this.findAll();
        const now = new Date();
        const discountPercent = 20;

        const filteredCars = cars.filter(car => {
            const monthDiff = getMonthDiff(car.firstRegistrationDate, now);
            return (
                car.discountPercent === 0 && monthDiff > 12 && monthDiff < 18
            );
        });

        await Promise.all(
            filteredCars.map(car =>
                this.carRepo.update(car.id, { discountPercent }),
            ),
        );
    }

    public static getDto(car: Car): CarDto {
        const {
            id,
            price,
            firstRegistrationDate,
            discountPercent,
            createdAt,
            updatedAt,
        } = car;

        return {
            id,
            price,
            firstRegistrationDate: firstRegistrationDate.toISOString(),
            discountPercent,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    }
}
