import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { random } from 'faker';
import { Repository } from 'typeorm';
import { getCarMock } from '../../test/car/utils';
import {
    getCreateOwnerDto,
    getOwnerMock,
    getUpdateOwnerDto,
} from '../../test/owner/utils';
import { Car } from '../car/car.entity';
import { CarService } from '../car/car.service';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';
import { MISSING_CAR_MESSAGE, NOT_FOUND_MESSAGE } from './owner.constants';
import { Owner } from './owner.entity';
import { OwnerService } from './owner.service';

describe('OwnerService', () => {
    let ownerService: OwnerService;
    let carService: CarService;
    let ownerRepo: Repository<Owner>;

    beforeEach(async () => {
        const repoToken = getRepositoryToken(Owner);
        const module = await Test.createTestingModule({
            providers: [
                OwnerService,
                CarService,
                ManufacturerService,
                {
                    provide: repoToken,
                    useClass: Repository,
                },
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

        ownerService = module.get<OwnerService>(OwnerService);
        carService = module.get<CarService>(CarService);
        ownerRepo = module.get<Repository<Owner>>(repoToken);
    });

    describe('findAll', () => {
        it('should return array of owners', async () => {
            const expectedResult = Array(5).map(() => getOwnerMock({}));

            jest.spyOn(ownerRepo, 'find').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await ownerService.findAll()).toEqual(expectedResult);
        });

        it('should throw InternalServerErrorException in case of find error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(ownerRepo, 'find').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await ownerService.findAll();
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

        it('should return owner by id', async () => {
            const expectedResult = getOwnerMock({});

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await ownerService.findById(id)).toEqual(expectedResult);
        });

        it('should return undefined if owner not found', async () => {
            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            expect(await ownerService.findById(id)).toBeUndefined();
        });

        it('should throw InternalServerErrorException in case of findOne error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await ownerService.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('create', () => {
        let payloadMock: CreateOwnerDto;
        let carMock: Car;

        beforeEach(() => {
            payloadMock = getCreateOwnerDto({ carId: random.number() });
            carMock = getCarMock({});
        });

        it('should return created owner', async () => {
            const expectedResult = getOwnerMock({});

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(ownerRepo, 'create').mockImplementationOnce(jest.fn());
            jest.spyOn(ownerRepo, 'save').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await ownerService.create(payloadMock)).toEqual(
                expectedResult,
            );
        });

        it('should throw InternalServerErrorException in case of find car by id error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => {
                    throw new InternalServerErrorException(errorMessage);
                },
            );

            try {
                await ownerService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw NotFoundException in case of car not found', async () => {
            const expectedError = new NotFoundException(MISSING_CAR_MESSAGE);

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await ownerService.create(payloadMock);
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

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(ownerRepo, 'create').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await ownerService.create(payloadMock);
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

            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => carMock,
            );
            jest.spyOn(ownerRepo, 'create').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await ownerService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('update', () => {
        let id: number;
        let payloadMock: UpdateOwnerDto;
        let ownerMock: Owner;

        beforeEach(() => {
            id = random.number();
            payloadMock = getUpdateOwnerDto({ carId: undefined });
            ownerMock = getOwnerMock({});
        });

        it('should return updated owner', async () => {
            const expectedResult = ownerMock;

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => expectedResult,
            );
            jest.spyOn(ownerRepo, 'merge').mockImplementationOnce(
                () => expectedResult,
            );
            jest.spyOn(ownerRepo, 'save').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(
                await ownerService.update({ id, payload: payloadMock }),
            ).toEqual(expectedResult);
        });

        it('should throw NotFoundException if owner not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await ownerService.update({ id, payload: payloadMock });
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

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'merge').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await ownerService.update({ id, payload: payloadMock });
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

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await ownerService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of carId is defined and find car by id error', async () => {
            payloadMock = getUpdateOwnerDto({ carId: random.number() });
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'merge').mockImplementationOnce(
                () => ownerMock,
            );
            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => {
                    throw new InternalServerErrorException(errorMessage);
                },
            );

            try {
                await ownerService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw NotFoundException in case of carId is defined and car not found', async () => {
            payloadMock = getUpdateOwnerDto({ carId: random.number() });
            const expectedError = new NotFoundException(MISSING_CAR_MESSAGE);

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'merge').mockImplementationOnce(
                () => ownerMock,
            );
            jest.spyOn(carService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await ownerService.update({ id, payload: payloadMock });
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

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'merge').mockImplementationOnce(
                () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'save').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await ownerService.update({ id, payload: payloadMock });
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

        it('should throw NotFoundException if owner not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await ownerService.delete(id);
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

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await ownerService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should return undefined if owner is deleted successfully', async () => {
            const ownerMock = getOwnerMock({});

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'delete').mockImplementationOnce(jest.fn());

            expect(await ownerService.delete(id)).toBeUndefined();
        });

        it('should throw InternalServerErrorException in case of delete error', async () => {
            const ownerMock = getOwnerMock({});
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(ownerRepo, 'findOne').mockImplementationOnce(
                async () => ownerMock,
            );
            jest.spyOn(ownerRepo, 'delete').mockImplementationOnce(async () => {
                throw new Error(errorMessage);
            });

            try {
                await ownerService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('getDto', () => {
        it('should return owner DTO', async () => {
            const ownerMock = getOwnerMock({});

            const result = OwnerService.getDto(ownerMock);

            expect(result).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    purchaseDate: expect.any(String),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
        });
    });
});
