import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { random } from 'faker';
import { Repository } from 'typeorm';
import {
    getCreateManufacturerDto,
    getManufacturerMock,
    getUpdateManufacturerDto,
} from '../../test/manufacturer/utils';
import { CreateManufacturerDto, UpdateManufacturerDto } from './dto';
import { NOT_FOUND_MESSAGE } from './manufacturer.constants';
import { Manufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';

describe('ManufacturerService', () => {
    let manufacturerService: ManufacturerService;
    let manufacturerRepo: Repository<Manufacturer>;

    beforeEach(async () => {
        const repoToken = getRepositoryToken(Manufacturer);
        const module = await Test.createTestingModule({
            providers: [
                ManufacturerService,
                {
                    provide: repoToken,
                    useClass: Repository,
                },
            ],
        }).compile();

        manufacturerService = module.get<ManufacturerService>(
            ManufacturerService,
        );
        manufacturerRepo = module.get<Repository<Manufacturer>>(repoToken);
    });

    describe('findAll', () => {
        it('should return array of manufacturers', async () => {
            const expectedResult = Array(5)
                .fill(null)
                .map(() => getManufacturerMock());

            jest.spyOn(manufacturerRepo, 'find').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await manufacturerService.findAll()).toEqual(expectedResult);
        });

        it('should throw InternalServerErrorException in case of find error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerRepo, 'find').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.findAll();
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

        it('should return manufacturer by id', async () => {
            const expectedResult = getManufacturerMock();

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await manufacturerService.findById(id)).toEqual(
                expectedResult,
            );
        });

        it('should return undefined if manufacturer not found', async () => {
            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            expect(await manufacturerService.findById(id)).toBeUndefined();
        });

        it('should throw InternalServerErrorException in case of findOne error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('create', () => {
        let payloadMock: CreateManufacturerDto;

        beforeEach(() => {
            payloadMock = getCreateManufacturerDto();
        });

        it('should return created manufacturer', async () => {
            const expectedResult = getManufacturerMock();

            jest.spyOn(manufacturerRepo, 'create').mockImplementationOnce(
                jest.fn(),
            );
            jest.spyOn(manufacturerRepo, 'save').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(await manufacturerService.create(payloadMock)).toEqual(
                expectedResult,
            );
        });

        it('should throw InternalServerErrorException in case of create error', async () => {
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerRepo, 'create').mockImplementationOnce(
                () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.create(payloadMock);
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

            jest.spyOn(manufacturerRepo, 'create').mockImplementationOnce(
                () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.create(payloadMock);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('update', () => {
        let id: number;
        let payloadMock: UpdateManufacturerDto;

        beforeEach(() => {
            id = random.number();
            payloadMock = getUpdateManufacturerDto();
        });

        it('should return updated manufacturer', async () => {
            const expectedResult = getManufacturerMock();

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => expectedResult,
            );
            jest.spyOn(manufacturerRepo, 'merge').mockImplementationOnce(
                () => expectedResult,
            );
            jest.spyOn(manufacturerRepo, 'save').mockImplementationOnce(
                async () => expectedResult,
            );

            expect(
                await manufacturerService.update({ id, payload: payloadMock }),
            ).toEqual(expectedResult);
        });

        it('should throw NotFoundException if manufacturer not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await manufacturerService.update({ id, payload: payloadMock });
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

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of merge error', async () => {
            const manufacturerMock = getManufacturerMock();
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(manufacturerRepo, 'merge').mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            try {
                await manufacturerService.update({ id, payload: payloadMock });
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should throw InternalServerErrorException in case of save error', async () => {
            const manufacturerMock = getManufacturerMock();
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(manufacturerRepo, 'merge').mockImplementationOnce(
                () => manufacturerMock,
            );
            jest.spyOn(manufacturerRepo, 'save').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.update({ id, payload: payloadMock });
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

        it('should throw NotFoundException if manufacturer not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await manufacturerService.delete(id);
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

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });

        it('should return undefined if manufacturer is deleted successfully', async () => {
            const manufacturerMock = getManufacturerMock();

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(manufacturerRepo, 'delete').mockImplementationOnce(
                jest.fn(),
            );

            expect(await manufacturerService.delete(id)).toBeUndefined();
        });

        it('should throw InternalServerErrorException in case of delete error', async () => {
            const manufacturerMock = getManufacturerMock();
            const errorMessage = random.word();
            const expectedError = new InternalServerErrorException(
                errorMessage,
            );

            jest.spyOn(manufacturerRepo, 'findOne').mockImplementationOnce(
                async () => manufacturerMock,
            );
            jest.spyOn(manufacturerRepo, 'delete').mockImplementationOnce(
                async () => {
                    throw new Error(errorMessage);
                },
            );

            try {
                await manufacturerService.delete(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalServerErrorException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('getDto', () => {
        it('should return manufacturer DTO', async () => {
            const manufacturerMock = getManufacturerMock();

            const result = ManufacturerService.getDto(manufacturerMock);

            expect(result).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    phone: expect.any(String),
                    siret: expect.any(Number),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
        });
    });
});
