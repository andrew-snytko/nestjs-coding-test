import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
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
import {
    MISSING_MANUFACTURER_MESSAGE,
    NOT_FOUND_MESSAGE,
} from './car.constants';
import { Car } from './car.entity';
import { CarService } from './car.service';
import { CreateCarDto, UpdateCarDto } from './dto';

describe('CarService', () => {
    let carService: CarService;
    let manufacturerService: ManufacturerService;
    let carRepo: Repository<Car>;

    beforeEach(async () => {
        const repoToken = getRepositoryToken(Car);
        const module = await Test.createTestingModule({
            providers: [
                CarService,
                ManufacturerService,
                {
                    provide: repoToken,
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Manufacturer),
                    useClass: Repository,
                },
            ],
        }).compile();

        carService = module.get<CarService>(CarService);
        manufacturerService = module.get<ManufacturerService>(
            ManufacturerService,
        );
        carRepo = module.get<Repository<Car>>(repoToken);
    });

    describe('findAll', () => {
        it('should return array of cars', async () => {
            const expectedResult = Array(5)
                .fill(null)
                .map(() => getCarMock({}));

            jest.spyOn(carRepo, 'find').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await carService.findAll()).toEqual(expectedResult);
        });

        it('should throw InternalServerErrorException in case of find error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'find').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await carService.findAll();
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('findById', () => {
        let id: number;

        beforeEach(() => {
            id = random.number();
        });

        it('should return car by id', async () => {
            const expectedResult = getCarMock({});

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await carService.findById(id)).toEqual(expectedResult);
        });

        it('should return undefined if car not found', async () => {
            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            expect(await carService.findById(id)).toBeUndefined();
        });

        it('should throw InternalServerErrorException in case of findOne error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await carService.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('create', () => {
        let payloadMock: CreateCarDto;
        let manufacturerMock: Manufacturer;

        beforeEach(() => {
            payloadMock = getCreateCarDto({ manufacturerId: random.number() });
            manufacturerMock = getManufacturerMock();
        });

        it('should return created car', async () => {
            const expectedResult = getCarMock({});

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(carRepo, 'create').mockImplementationOnce(jest.fn());
            jest.spyOn(carRepo, 'save').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await carService.create(payloadMock)).toEqual(
                expectedResult,
            );
        });

        it('should throw InternalServerErrorException in case of find manufacturer by id error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => {
                    throw new InternalServerErrorException(errorMessage);
                },
            );

            try {
                await carService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw NotFoundException in case of manufacturer not found', async () => {
            const expectedError = new NotFoundException(
                MISSING_MANUFACTURER_MESSAGE,
            );

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await carService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of create error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(carRepo, 'create').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await carService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of save error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(carRepo, 'create').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await carService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('update', () => {
        let id: number;
        let payloadMock: UpdateCarDto;
        let carMock: Car;

        beforeEach(() => {
            id = random.number();
            payloadMock = getUpdateCarDto({ manufacturerId: undefined });
            carMock = getCarMock({});
        });

        it('should return updated car', async () => {
            const expectedResult = carMock;

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => expectedResult,
            );
            jest.spyOn(carRepo, 'merge').mockImplementationOnce(
                () => expectedResult,
            );
            jest.spyOn(carRepo, 'save').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(
                await carService.update({ id, payload: payloadMock }),
            ).toEqual(expectedResult);
        });

        it('should throw NotFoundException if car not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await carService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of merge error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(carRepo, 'merge').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await carService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of find error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await carService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of manufacturerId is defined and find manufacturer by id error', async () => {
            payloadMock = getUpdateCarDto({ manufacturerId: random.number() });
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(carRepo, 'merge').mockImplementationOnce(() => carMock);
            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => {
                    throw new InternalServerErrorException(errorMessage);
                },
            );

            try {
                await carService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw NotFoundException in case of manufacturerId is defined and manufacturer not found', async () => {
            payloadMock = getUpdateCarDto({ manufacturerId: random.number() });
            const expectedError = new NotFoundException(
                MISSING_MANUFACTURER_MESSAGE,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(carRepo, 'merge').mockImplementationOnce(() => carMock);
            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await carService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of save error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(carRepo, 'merge').mockImplementationOnce(() => carMock);
            jest.spyOn(carRepo, 'save').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await carService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('delete', () => {
        let id: number;

        beforeEach(() => {
            id = random.number();
        });

        it('should throw NotFoundException if car not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await carService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of find error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await carService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should return undefined if car is deleted successfully', async () => {
            const carMock = getCarMock({});

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(carRepo, 'delete').mockImplementationOnce(jest.fn());

            expect(await carService.delete(id)).toBeUndefined();
        });

        it('should throw InternalServerErrorException in case of delete error', async () => {
            const carMock = getCarMock({});
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(carRepo, 'delete').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await carService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('getManufacturer', () => {
        let id: number;

        beforeEach(() => {
            id = random.number();
        });

        it('should throw NotFoundException if car not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await carService.getManufacturer(id);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should return car manufacturer', async () => {
            const manufacturerMock = getManufacturerMock();
            const carMock = getCarMock({ manufacturer: manufacturerMock });
            const expectedResult = ManufacturerService.getDto(manufacturerMock);

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );

            expect(await carService.getManufacturer(id)).toEqual(
                expectedResult,
            );
        });

        it('should throw InternalServerErrorException in case of ManufacturerService.getDto error', async () => {
            const carMock = getCarMock({});
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carRepo, 'findOne').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(ManufacturerService, 'getDto').mockImplementationOnce(
                () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await carService.getManufacturer(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('getDto', () => {
        it('should return car DTO', async () => {
            const carMock = getCarMock({});

            const result = CarService.getDto(carMock);

            expect(result).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    price: expect.any(Number),
                    firstRegistrationDate: expect.any(String),
                    discountPercent: expect.any(Number),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
        });
    });
});
