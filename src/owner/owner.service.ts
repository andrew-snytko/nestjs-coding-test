import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarService } from '../car/car.service';
import { getMonthDiff } from '../shared/utils';
import { CreateOwnerDto, OwnerDto } from './dto';
import { MISSING_CAR_MESSAGE, NOT_FOUND_MESSAGE } from './owner.constants';
import { Owner } from './owner.entity';
import { IUpdateOwner } from './owner.interface';

@Injectable()
export class OwnerService {
    constructor(
        @InjectRepository(Owner)
        private readonly ownerRepo: Repository<Owner>,
        private readonly carService: CarService,
    ) {}

    public async findAll(): Promise<Owner[]> {
        try {
            return await this.ownerRepo.find();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async findById(id: number): Promise<Owner | undefined> {
        try {
            return await this.ownerRepo.findOne(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async create(payload: CreateOwnerDto): Promise<Owner> {
        const { carId } = payload;
        const car = await this.carService.findById(carId);

        if (!car) {
            throw new NotFoundException(MISSING_CAR_MESSAGE);
        }

        try {
            const owner = this.ownerRepo.create({
                ...payload,
                car,
            });

            return await this.ownerRepo.save(owner);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async update(data: IUpdateOwner): Promise<Owner> {
        const { id, payload } = data;
        const { carId } = payload;
        let ownerToUpdate: Owner;

        const owner = await this.findById(id);

        if (!owner) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            ownerToUpdate = this.ownerRepo.merge(owner, payload);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }

        if (typeof carId !== 'undefined') {
            const car = await this.carService.findById(carId);

            if (!car) {
                throw new NotFoundException(MISSING_CAR_MESSAGE);
            }

            ownerToUpdate.car = car;
        }

        try {
            return await this.ownerRepo.save(ownerToUpdate);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async delete(id: number): Promise<void> {
        const owner = await this.findById(id);

        if (!owner) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        try {
            await this.ownerRepo.delete(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    public async removeOldRecords(): Promise<void> {
        const owners = await this.findAll();
        const now = new Date();
        const monthDiffThreshold = 18;

        const filteredOwners = owners.filter(owner => {
            const monthDiff = getMonthDiff(owner.purchaseDate, now);
            return monthDiff > monthDiffThreshold;
        });

        await Promise.all(filteredOwners.map(owner => this.delete(owner.id)));
    }

    public static getDto(owner: Owner): OwnerDto {
        const { id, name, purchaseDate, createdAt, updatedAt } = owner;

        return {
            id,
            name,
            purchaseDate: purchaseDate.toISOString(),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    }
}
