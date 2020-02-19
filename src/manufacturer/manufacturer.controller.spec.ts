import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { random } from 'faker';
import { Repository } from 'typeorm';
import {
    getCreateManufacturerDto,
    getManufacturerMock,
    getUpdateManufacturerDto,
} from '../../test/manufacturer/utils';
import { NOT_FOUND_MESSAGE } from './manufacturer.constants';
import { ManufacturerController } from './manufacturer.controller';
import { Manufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';

describe('ManufacturerController', () => {
    let manufacturerController: ManufacturerController;
    let manufacturerService: ManufacturerService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [ManufacturerController],
            providers: [
                ManufacturerService,
                {
                    provide: getRepositoryToken(Manufacturer),
                    useClass: Repository,
                },
            ],
        }).compile();

        manufacturerController = module.get<ManufacturerController>(
            ManufacturerController,
        );
        manufacturerService = module.get<ManufacturerService>(
            ManufacturerService,
        );
    });

    describe('findAll', () => {
        it('should return array of manufacturers', async () => {
            const manufacturersMock = Array(5).map(() => getManufacturerMock());
            const expectedResult = manufacturersMock.map(manufacturer =>
                ManufacturerService.getDto(manufacturer),
            );

            jest.spyOn(manufacturerService, 'findAll').mockImplementationOnce(
                async () => manufacturersMock,
            );

            expect(await manufacturerController.findAll()).toEqual(
                expectedResult,
            );
        });
    });

    describe('findById', () => {
        it('should return manufacturer by id', async () => {
            const manufacturerMock = getManufacturerMock();
            const expectedResult = ManufacturerService.getDto(manufacturerMock);
            const id = random.number();

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => manufacturerMock,
            );

            expect(await manufacturerController.findById(id)).toEqual(
                expectedResult,
            );
        });

        it('should throw NotFoundException if manufacturer not found', async () => {
            const id = random.number();
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(manufacturerService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await manufacturerController.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('create', () => {
        it('should return created manufacturer', async () => {
            const manufacturerMock = getManufacturerMock();
            const expectedResult = ManufacturerService.getDto(manufacturerMock);
            const payloadMock = getCreateManufacturerDto();

            jest.spyOn(manufacturerService, 'create').mockImplementationOnce(
                async () => manufacturerMock,
            );

            expect(await manufacturerController.create(payloadMock)).toEqual(
                expectedResult,
            );
        });
    });

    describe('update', () => {
        it('should return updated manufacturer', async () => {
            const manufacturerMock = getManufacturerMock();
            const expectedResult = ManufacturerService.getDto(manufacturerMock);
            const id = random.number();
            const payloadMock = getUpdateManufacturerDto();

            jest.spyOn(manufacturerService, 'update').mockImplementationOnce(
                async () => manufacturerMock,
            );

            expect(
                await manufacturerController.update(id, payloadMock),
            ).toEqual(expectedResult);
        });
    });

    describe('delete', () => {
        it('should return undefined', async () => {
            const id = random.number();

            jest.spyOn(manufacturerService, 'delete').mockImplementationOnce(
                jest.fn(),
            );

            expect(await manufacturerController.delete(id)).toBeUndefined();
        });
    });
});
