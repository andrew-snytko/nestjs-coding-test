import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../car/car.entity';
import { CarService } from '../car/car.service';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { OwnerController } from './owner.controller';
import { Owner } from './owner.entity';
import { OwnerService } from './owner.service';

@Module({
    imports: [TypeOrmModule.forFeature([Owner, Car, Manufacturer])],
    controllers: [OwnerController],
    providers: [OwnerService, CarService, ManufacturerService],
})
export class OwnerModule {}
