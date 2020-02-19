import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../car/car.entity';
import { CarService } from '../car/car.service';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { Owner } from '../owner/owner.entity';
import { OwnerService } from '../owner/owner.service';
import { CronJobService } from './cron-job.service';

@Module({
    imports: [TypeOrmModule.forFeature([Owner, Car, Manufacturer])],
    providers: [CronJobService, OwnerService, CarService, ManufacturerService],
})
export class CronJobModule {}
