import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManufacturerController } from './manufacturer.controller';
import { Manufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';

@Module({
    imports: [TypeOrmModule.forFeature([Manufacturer])],
    controllers: [ManufacturerController],
    providers: [ManufacturerService],
})
export class ManufacturerModule {}
