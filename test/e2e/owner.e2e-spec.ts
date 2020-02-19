import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { Car } from '../../src/car/car.entity';
import { CarModule } from '../../src/car/car.module';
import { CarService } from '../../src/car/car.service';
import { ConfigModule } from '../../src/config/config.module';
import { ConfigService } from '../../src/config/config.service';
import { Manufacturer } from '../../src/manufacturer/manufacturer.entity';
import { ManufacturerModule } from '../../src/manufacturer/manufacturer.module';
import { ManufacturerService } from '../../src/manufacturer/manufacturer.service';
import { OwnerModule } from '../../src/owner/owner.module';
import { OwnerService } from '../../src/owner/owner.service';
import { getCreateCarDto, removeAllCars } from '../car/utils';
import {
    getCreateManufacturerDto,
    removeAllManufacturers,
} from '../manufacturer/utils';
import {
    getCreateOwnerDto,
    getUpdateOwnerDto,
    removeAllOwners,
} from '../owner/utils';
import { createNestApplication, getTestOrmConfig } from '../utils';

describe('/owners', () => {
    let app: INestApplication;
    let httpServer: any;
    let ownerService: OwnerService;
    let carService: CarService;
    let manufacturerService: ManufacturerService;
    let manufacturer: Manufacturer;
    let car: Car;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) =>
                        getTestOrmConfig(configService.getOrmConfig()),
                }),
                ManufacturerModule,
                OwnerModule,
                CarModule,
                ConfigModule.forRoot(),
            ],
        }).compile();

        app = createNestApplication(module);
        await app.init();

        httpServer = app.getHttpServer();
        ownerService = app.get(OwnerService);
        carService = app.get(CarService);
        manufacturerService = app.get(ManufacturerService);
    });

    beforeEach(async () => {
        manufacturer = await manufacturerService.create(
            getCreateManufacturerDto(),
        );
        car = await carService.create(
            getCreateCarDto({ manufacturerId: manufacturer.id }),
        );
    });

    afterEach(async () => {
        await removeAllCars(carService);
        await removeAllManufacturers(manufacturerService);
        await removeAllOwners(ownerService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /', () => {
        it('should return all owners', async () => {
            const owners = await Promise.all([
                ownerService.create(getCreateOwnerDto({ carId: car.id })),
                ownerService.create(getCreateOwnerDto({ carId: car.id })),
                ownerService.create(getCreateOwnerDto({ carId: car.id })),
            ]);
            const expectedResult = owners.map(owner =>
                OwnerService.getDto(owner),
            );
            expectedResult.sort((a, b) => a.id - b.id);
            const expectedStatus = 200;

            const response = await request(httpServer).get('/owners');

            expect(response.status).toEqual(expectedStatus);
            response.body.sort((a: any, b: any) => a.id - b.id);
            expect(response.body).toEqual(expectedResult);
        });
    });

    describe('GET /:id', () => {
        it('should return owner by id', async () => {
            const owner = await ownerService.create(
                getCreateOwnerDto({ carId: car.id }),
            );
            const expectedResult = OwnerService.getDto(owner);
            const expectedStatus = 200;

            const response = await request(httpServer).get(
                `/owners/${owner.id}`,
            );

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(expectedResult);
        });

        it('should return status 404 if owner not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Owner not found';

            const response = await request(httpServer).get(`/owners/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).get(`/owners/qwerty`);

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('POST /', () => {
        it('should return created owner', async () => {
            const payload = getCreateOwnerDto({ carId: car.id });
            const expectedStatus = 201;

            const response = await request(httpServer)
                .post('/owners')
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    purchaseDate: expect.any(String),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
            expect(response.body.name).toEqual(payload.name);
        });

        it('should return status 400 if invalid payload provided', async () => {
            const expectedStatus = 400;

            const response = await request(httpServer)
                .post('/owners')
                .send({})
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
        });

        it('should return status 404 if owner car not found', async () => {
            const payload = getCreateOwnerDto({});
            const expectedStatus = 404;
            const expectedErrorMessage = 'Owner car not found';

            const response = await request(httpServer)
                .post('/owners')
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });
    });

    describe('PATCH /:id', () => {
        it('should return updated owner', async () => {
            const owner = await ownerService.create(
                getCreateOwnerDto({ carId: car.id }),
            );
            const payload = getUpdateOwnerDto({ carId: car.id });
            const expectedStatus = 200;

            const response = await request(httpServer)
                .patch(`/owners/${owner.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    purchaseDate: expect.any(String),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
            expect(response.body.name).toEqual(payload.name);
            expect(
                new Date(response.body.updatedAt) > owner.updatedAt,
            ).toBeTruthy();
        });

        it('should return status 404 if owner not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Owner not found';

            const response = await request(httpServer).patch(`/owners/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).patch(`/owners/qwerty`);

            expect(response.status).toEqual(expectedStatus);
        });

        it('should return status 400 if invalid payload provided', async () => {
            const owner = await ownerService.create(
                getCreateOwnerDto({ carId: car.id }),
            );
            const payload = { id: owner.id };
            const expectedStatus = 400;

            const response = await request(httpServer)
                .patch(`/owners/${owner.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete owner', async () => {
            const owner = await ownerService.create(
                getCreateOwnerDto({ carId: car.id }),
            );
            const expectedStatus = 204;

            const response = await request(httpServer).delete(
                `/owners/${owner.id}`,
            );

            expect(response.status).toEqual(expectedStatus);
            const deletedOwner = await ownerService.findById(owner.id);
            expect(deletedOwner).toBeUndefined();
        });

        it('should return status 404 if owner not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Owner not found';

            const response = await request(httpServer).delete(`/owners/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).delete(`/owners/qwerty`);

            expect(response.status).toEqual(expectedStatus);
        });
    });
});
