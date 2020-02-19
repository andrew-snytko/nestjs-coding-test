import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ENV_VARIABLE } from './config/config.constants';
import { ConfigService } from './config/config.service';

function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle('Cars data test task')
        .setDescription('The cats API description')
        .setVersion('0.1.0')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
}

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const PORT: number = Number(configService.getEnvVar(ENV_VARIABLE.APP_PORT));
    const NODE_ENV = configService.getNodeEnv();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    setupSwagger(app);

    await app.listen(PORT, '0.0.0.0', () =>
        console.log(
            `🚀 Server is running on port ${PORT} for '${NODE_ENV}' environment`,
        ),
    );
}

bootstrap();
