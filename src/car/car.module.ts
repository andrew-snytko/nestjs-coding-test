import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { CarController } from './car.controller';
import { Car } from './car.entity';
import { CarService } from './car.service';

@Module({
    imports: [TypeOrmModule.forFeature([Car, Manufacturer])],
    controllers: [CarController],
    providers: [CarService, ManufacturerService],
})
export class CarModule {}
