import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { random } from 'faker';
import { Repository } from 'typeorm';
import {
    getCarMock,
    getCreateCarDto,
    getUpdateCarDto,
} from '../../test/car/utils';
import { getManufacturerMock } from '../../test/manufacturer/utils';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { NOT_FOUND_MESSAGE } from './car.constants';
import { CarController } from './car.controller';
import { Car } from './car.entity';
import { CarService } from './car.service';

describe('CarController', () => {
    let carController: CarController;
    let carService: CarService;
    let id: number;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [CarController],
            providers: [
                CarService,
                ManufacturerService,
                {
                    provide: getRepositoryToken(Car),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Manufacturer),
                    useClass: Repository,
                },
            ],
        }).compile();

        carController = module.get<CarController>(CarController);
        carService = module.get<CarService>(CarService);
        id = random.number();
    });

    describe('findAll', () => {
        it('should return array of cars', async () => {
            const carsMock = Array(5).map(() => getCarMock({}));
            const expectedResult = carsMock.map(car => CarService.getDto(car));

            jest.spyOn(carService, 'findAll').mockImplementationOnce(
                async () => carsMock,
            );

            expect(await carController.findAll()).toEqual(expectedResult);
        });
    });

    describe('findById', () => {
        it('should return car by id', async () => {
            const carMock = getCarMock({});
            const expectedResult = CarService.getDto(carMock);

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => carMock,
            );

            expect(await carController.findById(id)).toEqual(expectedResult);
        });

        it('should throw NotFoundException if car not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await carController.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('create', () => {
        it('should return created car', async () => {
            const carMock = getCarMock({});
            const expectedResult = CarService.getDto(carMock);
            const payloadMock = getCreateCarDto({});

            jest.spyOn(carService, 'create').mockImplementationOnce(
                async () => carMock,
            );

            expect(await carController.create(payloadMock)).toEqual(
                expectedResult,
            );
        });
    });

    describe('update', () => {
        it('should return updated car', async () => {
            const carMock = getCarMock({});
            const expectedResult = CarService.getDto(carMock);
            const payloadMock = getUpdateCarDto({});

            jest.spyOn(carService, 'update').mockImplementationOnce(
                async () => carMock,
            );

            expect(await carController.update(id, payloadMock)).toEqual(
                expectedResult,
            );
        });
    });

    describe('delete', () => {
        it('should return undefined', async () => {
            jest.spyOn(carService, 'delete').mockImplementationOnce(jest.fn());

            expect(await carController.delete(id)).toBeUndefined();
        });
    });

    describe('getCarManufacturer', () => {
        it('should return car manufacturer', async () => {
            const manufacturerMock = getManufacturerMock();
            const manufacturerDto = ManufacturerService.getDto(
                manufacturerMock,
            );

            jest.spyOn(carService, 'getManufacturer').mockImplementationOnce(
                async () => manufacturerDto,
            );

            expect(await carController.getCarManufacturer(id)).toEqual(
                manufacturerDto,
            );
        });
    });
});
