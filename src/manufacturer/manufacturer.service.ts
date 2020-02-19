import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateManufacturerDto, ManufacturerDto } from './dto';
import { NOT_FOUND_MESSAGE } from './manufacturer.constants';
import { Manufacturer } from './manufacturer.entity';
import { IUpdateManufacturer } from './manufacturer.interface';

@Injectable()
export class ManufacturerService {
    constructor(
        @InjectRepository(Manufacturer)
        private readonly manufacturerRepo: Repository<Manufacturer>,
    ) {}

    public async findAll(): Promise<Manufacturer[]> {
        try {
            return await this.manufacturerRepo.find();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async findById(id: number): Promise<Manufacturer | undefined> {
        try {
            return await this.manufacturerRepo.findOne(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async create(payload: CreateManufacturerDto): Promise<Manufacturer> {
        try {
            const manufacturer = this.manufacturerRepo.create(payload);

            return await this.manufacturerRepo.save(manufacturer);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async update(data: IUpdateManufacturer): Promise<Manufacturer> {
        const { id, payload } = data;
        const manufacturer = await this.findById(id);

        if (!manufacturer) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            const manufacturerToUpdate = this.manufacturerRepo.merge(
                manufacturer,
                payload,
            );
            return await this.manufacturerRepo.save(manufacturerToUpdate);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async delete(id: number): Promise<void> {
        const manufacturer = await this.findById(id);

        if (!manufacturer) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            await this.manufacturerRepo.delete(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public static getDto(manufacturer: Manufacturer): ManufacturerDto {
        const { id, name, phone, siret, createdAt, updatedAt } = manufacturer;

        return {
            id,
            name,
            phone,
            siret,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    }
}
