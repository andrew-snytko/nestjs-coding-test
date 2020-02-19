import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { random } from 'faker';
import { Repository } from 'typeorm';
import {
    getCreateOwnerDto,
    getOwnerMock,
    getUpdateOwnerDto,
} from '../../test/owner/utils';
import { Car } from '../car/car.entity';
import { CarService } from '../car/car.service';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { NOT_FOUND_MESSAGE } from './owner.constants';
import { OwnerController } from './owner.controller';
import { Owner } from './owner.entity';
import { OwnerService } from './owner.service';

describe('OwnerController', () => {
    let ownerController: OwnerController;
    let ownerService: OwnerService;
    let id: number;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [OwnerController],
            providers: [
                OwnerService,
                CarService,
                ManufacturerService,
                {
                    provide: getRepositoryToken(Owner),
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

        ownerController = module.get<OwnerController>(OwnerController);
        ownerService = module.get<OwnerService>(OwnerService);
        id = random.number();
    });

    describe('findAll', () => {
        it('should return array of owners', async () => {
            const ownersMock = Array(5).map(() => getOwnerMock({}));
            const expectedResult = ownersMock.map(owner =>
                OwnerService.getDto(owner),
            );

            jest.spyOn(ownerService, 'findAll').mockImplementationOnce(
                async () => ownersMock,
            );

            expect(await ownerController.findAll()).toEqual(expectedResult);
        });
    });

    describe('findById', () => {
        it('should return owner by id', async () => {
            const ownerMock = getOwnerMock({});
            const expectedResult = OwnerService.getDto(ownerMock);

            jest.spyOn(ownerService, 'findById').mockImplementationOnce(
                async () => ownerMock,
            );

            expect(await ownerController.findById(id)).toEqual(expectedResult);
        });

        it('should throw NotFoundException if owner not found', async () => {
            const expectedError = new NotFoundException(NOT_FOUND_MESSAGE);

            jest.spyOn(ownerService, 'findById').mockImplementationOnce(
                async () => undefined,
            );

            try {
                await ownerController.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toEqual(expectedError.message);
            }
        });
    });

    describe('create', () => {
        it('should return created owner', async () => {
            const ownerMock = getOwnerMock({});
            const expectedResult = OwnerService.getDto(ownerMock);
            const payloadMock = getCreateOwnerDto({});

            jest.spyOn(ownerService, 'create').mockImplementationOnce(
                async () => ownerMock,
            );

            expect(await ownerController.create(payloadMock)).toEqual(
                expectedResult,
            );
        });
    });

    describe('update', () => {
        it('should return updated owner', async () => {
            const ownerMock = getOwnerMock({});
            const expectedResult = OwnerService.getDto(ownerMock);
            const payloadMock = getUpdateOwnerDto({});

            jest.spyOn(ownerService, 'update').mockImplementationOnce(
                async () => ownerMock,
            );

            expect(await ownerController.update(id, payloadMock)).toEqual(
                expectedResult,
            );
        });
    });

    describe('delete', () => {
        it('should return undefined', async () => {
            jest.spyOn(ownerService, 'delete').mockImplementationOnce(
                jest.fn(),
            );

            expect(await ownerController.delete(id)).toBeUndefined();
        });
    });
});
