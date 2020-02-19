import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModule } from './car/car.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { CronJobModule } from './cron-job/cron-job.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { OwnerModule } from './owner/owner.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                configService.getOrmConfig(),
        }),
        ScheduleModule.forRoot(),
        CarModule,
        ManufacturerModule,
        OwnerModule,
        CronJobModule,
        ConfigModule.forRoot(),
    ],
})
export class AppModule {}
