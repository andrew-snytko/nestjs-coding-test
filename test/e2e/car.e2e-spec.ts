import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { random } from 'faker';
import request from 'supertest';
import { CarModule } from '../../src/car/car.module';
import { CarService } from '../../src/car/car.service';
import { ConfigModule } from '../../src/config/config.module';
import { ConfigService } from '../../src/config/config.service';
import { Manufacturer } from '../../src/manufacturer/manufacturer.entity';
import { ManufacturerModule } from '../../src/manufacturer/manufacturer.module';
import { ManufacturerService } from '../../src/manufacturer/manufacturer.service';
import { OwnerModule } from '../../src/owner/owner.module';
import { getCreateCarDto, getUpdateCarDto, removeAllCars } from '../car/utils';
import {
    getCreateManufacturerDto,
    removeAllManufacturers,
} from '../manufacturer/utils';
import { createNestApplication, getTestOrmConfig } from '../utils';

describe('/cars', () => {
    let app: INestApplication;
    let httpServer: any;
    let carService: CarService;
    let manufacturerService: ManufacturerService;
    let manufacturer: Manufacturer;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) =>
                        getTestOrmConfig(configService.getOrmConfig()),
                }),
                OwnerModule,
                ManufacturerModule,
                CarModule,
                ConfigModule.forRoot(),
            ],
        }).compile();

        app = createNestApplication(module);
        await app.init();

        httpServer = app.getHttpServer();
        carService = app.get(CarService);
        manufacturerService = app.get(ManufacturerService);
    });

    beforeEach(async () => {
        manufacturer = await manufacturerService.create(
            getCreateManufacturerDto(),
        );
    });

    afterEach(async () => {
        await removeAllCars(carService);
        await removeAllManufacturers(manufacturerService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /', () => {
        it('should return all cars', async () => {
            const cars = await Promise.all([
                carService.create(
                    getCreateCarDto({ manufacturerId: manufacturer.id }),
                ),
                carService.create(
                    getCreateCarDto({ manufacturerId: manufacturer.id }),
                ),
                carService.create(
                    getCreateCarDto({ manufacturerId: manufacturer.id }),
                ),
            ]);
            const expectedResult = cars.map(car => CarService.getDto(car));
            expectedResult.sort((a, b) => a.id - b.id);
            const expectedStatus = 200;

            const response = await request(httpServer).get('/cars');

            expect(response.status).toEqual(expectedStatus);
            response.body.sort((a: any, b: any) => a.id - b.id);
            expect(response.body).toEqual(expectedResult);
        });
    });

    describe('GET /:id', () => {
        it('should return car by id', async () => {
            const car = await carService.create(
                getCreateCarDto({ manufacturerId: manufacturer.id }),
            );
            const expectedResult = CarService.getDto(car);
            const expectedStatus = 200;

            const response = await request(httpServer).get(`/cars/${car.id}`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(expectedResult);
        });

        it('should return status 404 if car not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Car not found';

            const response = await request(httpServer).get(`/cars/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).get(`/cars/qwerty`);

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('POST /', () => {
        it('should return created car', async () => {
            const payload = getCreateCarDto({
                manufacturerId: manufacturer.id,
            });
            const expectedStatus = 201;

            const response = await request(httpServer)
                .post('/cars')
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    price: expect.any(Number),
                    firstRegistrationDate: expect.any(String),
                    discountPercent: expect.any(Number),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
            expect(response.body.price).toEqual(payload.price);
            expect(response.body.firstRegistrationDate).toEqual(
                payload.firstRegistrationDate,
            );
        });

        it('should return status 400 if invalid payload provided', async () => {
            const expectedStatus = 400;

            const response = await request(httpServer)
                .post('/cars')
                .send({})
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
        });

        it('should return status 404 if car manufacturer not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Car manufacturer not found';
            const payload = getCreateCarDto({});

            const response = await request(httpServer)
                .post('/cars')
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });
    });

    describe('PATCH /:id', () => {
        it('should return updated car', async () => {
            const car = await carService.create(
                getCreateCarDto({ manufacturerId: manufacturer.id }),
            );
            const payload = getUpdateCarDto({
                manufacturerId: manufacturer.id,
            });
            const expectedStatus = 200;

            const response = await request(httpServer)
                .patch(`/cars/${car.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    price: expect.any(Number),
                    firstRegistrationDate: expect.any(String),
                    discountPercent: expect.any(Number),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
            expect(response.body.price).toEqual(payload.price);
            expect(response.body.firstRegistrationDate).toEqual(
                payload.firstRegistrationDate,
            );
            expect(
                new Date(response.body.updatedAt) > car.updatedAt,
            ).toBeTruthy();
        });

        it('should return status 404 if car not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Car not found';

            const response = await request(httpServer).patch(`/cars/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).patch(`/cars/qwerty`);

            expect(response.status).toEqual(expectedStatus);
        });

        it('should return status 400 if invalid payload provided', async () => {
            const car = await carService.create(
                getCreateCarDto({ manufacturerId: manufacturer.id }),
            );
            const payload = { id: car.id };
            const expectedStatus = 400;

            const response = await request(httpServer)
                .patch(`/cars/${car.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
        });

        it('should return status 404 if car manufacturer not found', async () => {
            const car = await carService.create(
                getCreateCarDto({ manufacturerId: manufacturer.id }),
            );
            const expectedStatus = 404;
            const expectedErrorMessage = 'Car manufacturer not found';
            const payload = getUpdateCarDto({
                manufacturerId: random.number(),
            });

            const response = await request(httpServer)
                .patch(`/cars/${car.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete car', async () => {
            const car = await carService.create(
                getCreateCarDto({ manufacturerId: manufacturer.id }),
            );
            const expectedStatus = 204;

            const response = await request(httpServer).delete(
                `/cars/${car.id}`,
            );

            expect(response.status).toEqual(expectedStatus);
            const deletedCar = await carService.findById(car.id);
            expect(deletedCar).toBeUndefined();
        });

        it('should return status 404 if car not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Car not found';

            const response = await request(httpServer).delete(`/cars/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).delete(`/cars/qwerty`);

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('GET /:id/manufacturer', () => {
        it('should return car manufacturer', async () => {
            const car = await carService.create(
                getCreateCarDto({ manufacturerId: manufacturer.id }),
            );
            const expectedResult = ManufacturerService.getDto(manufacturer);
            const expectedStatus = 200;

            const response = await request(httpServer).get(
                `/cars/${car.id}/manufacturer`,
            );

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(expectedResult);
        });

        it('should return status 404 if car not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Car not found';

            const response = await request(httpServer).get(
                `/cars/0/manufacturer`,
            );

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });
    });
});
