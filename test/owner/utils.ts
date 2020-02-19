import { date, name, random } from 'faker';
import { Car } from '../../src/car/car.entity';
import { CreateOwnerDto, UpdateOwnerDto } from '../../src/owner/dto';
import { Owner } from '../../src/owner/owner.entity';
import { OwnerService } from '../../src/owner/owner.service';
import { getCarMock } from '../car/utils';

export function getOwnerMock({ car }: { car?: Car }): Owner {
    return {
        id: random.number(),
        car: car || getCarMock({}),
        name: name.findName(),
        purchaseDate: date.recent(),
        createdAt: date.recent(),
        updatedAt: date.recent(),
    };
}

export function getCreateOwnerDto({
    carId,
}: {
    carId?: number;
}): CreateOwnerDto {
    return {
        carId: carId || random.number(),
        name: name.findName(),
    };
}

export function getUpdateOwnerDto({
    carId,
}: {
    carId?: number;
}): UpdateOwnerDto {
    return {
        carId,
        name: name.findName(),
    };
}

export async function removeAllOwners(
    ownerService: OwnerService,
): Promise<void> {
    const owners = await ownerService.findAll();
    await Promise.all(owners.map(owner => ownerService.delete(owner.id)));
}
