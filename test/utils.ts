import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getTestOrmConfig(
    config: TypeOrmModuleOptions,
): TypeOrmModuleOptions {
    return {
        ...config,
        synchronize: true,
        dropSchema: true,
    };
}

export function createNestApplication(module: TestingModule): INestApplication {
    const app = module.createNestApplication();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    return app;
}
