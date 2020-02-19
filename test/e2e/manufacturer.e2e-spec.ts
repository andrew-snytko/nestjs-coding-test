import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { CarModule } from '../../src/car/car.module';
import { ConfigModule } from '../../src/config/config.module';
import { ConfigService } from '../../src/config/config.service';
import { ManufacturerModule } from '../../src/manufacturer/manufacturer.module';
import { ManufacturerService } from '../../src/manufacturer/manufacturer.service';
import { OwnerModule } from '../../src/owner/owner.module';
import {
    getCreateManufacturerDto,
    getUpdateManufacturerDto,
    removeAllManufacturers,
} from '../manufacturer/utils';
import { createNestApplication, getTestOrmConfig } from '../utils';

describe('/manufacturers', () => {
    let app: INestApplication;
    let httpServer: any;
    let manufacturerService: ManufacturerService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) =>
                        getTestOrmConfig(configService.getOrmConfig()),
                }),
                OwnerModule,
                CarModule,
                ManufacturerModule,
                ConfigModule.forRoot(),
            ],
        }).compile();

        app = createNestApplication(module);
        await app.init();

        httpServer = app.getHttpServer();
        manufacturerService = app.get(ManufacturerService);
    });

    afterEach(async () => {
        await removeAllManufacturers(manufacturerService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /', () => {
        it('should return all manufacturers', async () => {
            const manufacturers = await Promise.all([
                manufacturerService.create(getCreateManufacturerDto()),
                manufacturerService.create(getCreateManufacturerDto()),
                manufacturerService.create(getCreateManufacturerDto()),
            ]);
            const expectedResult = manufacturers.map(manufacturer =>
                ManufacturerService.getDto(manufacturer),
            );
            expectedResult.sort((a, b) => a.id - b.id);
            const expectedStatus = 200;

            const response = await request(httpServer).get('/manufacturers');

            expect(response.status).toEqual(expectedStatus);
            response.body.sort((a: any, b: any) => a.id - b.id);
            expect(response.body).toEqual(expectedResult);
        });
    });

    describe('GET /:id', () => {
        it('should return manufacturer by id', async () => {
            const manufacturer = await manufacturerService.create(
                getCreateManufacturerDto(),
            );
            const expectedResult = ManufacturerService.getDto(manufacturer);
            const expectedStatus = 200;

            const response = await request(httpServer).get(
                `/manufacturers/${manufacturer.id}`,
            );

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(expectedResult);
        });

        it('should return status 404 if manufacturer not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Manufacturer not found';

            const response = await request(httpServer).get(`/manufacturers/0`);

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).get(
                `/manufacturers/qwerty`,
            );

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('POST /', () => {
        it('should return created manufacturer', async () => {
            const payload = getCreateManufacturerDto();
            const expectedStatus = 201;

            const response = await request(httpServer)
                .post('/manufacturers')
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    phone: expect.any(String),
                    siret: expect.any(Number),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
            expect(response.body.name).toEqual(payload.name);
            expect(response.body.phone).toEqual(payload.phone);
            expect(response.body.siret).toEqual(payload.siret);
        });

        it('should return status 400 if invalid payload provided', async () => {
            const expectedStatus = 400;

            const response = await request(httpServer)
                .post('/manufacturers')
                .send({})
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('PATCH /:id', () => {
        it('should return updated manufacturer', async () => {
            const manufacturer = await manufacturerService.create(
                getCreateManufacturerDto(),
            );
            const payload = getUpdateManufacturerDto();
            const expectedStatus = 200;

            const response = await request(httpServer)
                .patch(`/manufacturers/${manufacturer.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    phone: expect.any(String),
                    siret: expect.any(Number),
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String),
                }),
            );
            expect(response.body.name).toEqual(payload.name);
            expect(response.body.phone).toEqual(payload.phone);
            expect(response.body.siret).toEqual(payload.siret);
            expect(
                new Date(response.body.updatedAt) > manufacturer.updatedAt,
            ).toBeTruthy();
        });

        it('should return status 404 if manufacturer not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Manufacturer not found';

            const response = await request(httpServer).patch(
                `/manufacturers/0`,
            );

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).patch(
                `/manufacturers/qwerty`,
            );

            expect(response.status).toEqual(expectedStatus);
        });

        it('should return status 400 if invalid payload provided', async () => {
            const manufacturer = await manufacturerService.create(
                getCreateManufacturerDto(),
            );
            const payload = { id: manufacturer.id };
            const expectedStatus = 400;

            const response = await request(httpServer)
                .patch(`/manufacturers/${manufacturer.id}`)
                .send(payload)
                .set('Accept', 'application/json');

            expect(response.status).toEqual(expectedStatus);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete manufacturer', async () => {
            const manufacturer = await manufacturerService.create(
                getCreateManufacturerDto(),
            );
            const expectedStatus = 204;

            const response = await request(httpServer).delete(
                `/manufacturers/${manufacturer.id}`,
            );

            expect(response.status).toEqual(expectedStatus);
            const deletedManufacturer = await manufacturerService.findById(
                manufacturer.id,
            );
            expect(deletedManufacturer).toBeUndefined();
        });

        it('should return status 404 if manufacturer not found', async () => {
            const expectedStatus = 404;
            const expectedErrorMessage = 'Manufacturer not found';

            const response = await request(httpServer).delete(
                `/manufacturers/0`,
            );

            expect(response.status).toEqual(expectedStatus);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toEqual(expectedErrorMessage);
        });

        it('should return status 400 if invalid id provided', async () => {
            const expectedStatus = 400;
            const response = await request(httpServer).delete(
                `/manufacturers/qwerty`,
            );

            expect(response.status).toEqual(expectedStatus);
        });
    });
});
