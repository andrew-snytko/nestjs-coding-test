import { date, phone, random } from 'faker';
import {
    CreateManufacturerDto,
    UpdateManufacturerDto,
} from '../../src/manufacturer/dto';
import { Manufacturer } from '../../src/manufacturer/manufacturer.entity';
import { ManufacturerService } from '../../src/manufacturer/manufacturer.service';

export function getManufacturerMock(): Manufacturer {
    return {
        id: random.number(),
        name: random.word(),
        phone: phone.phoneNumber(),
        siret: random.number(),
        createdAt: date.recent(),
        updatedAt: date.recent(),
        cars: [],
    };
}

export function getCreateManufacturerDto(): CreateManufacturerDto {
    return {
        name: random.word(),
        phone: phone.phoneNumber(),
        siret: random.number(),
    };
}

export function getUpdateManufacturerDto(): UpdateManufacturerDto {
    return {
        name: random.word(),
        phone: phone.phoneNumber(),
        siret: random.number(),
    };
}

export async function removeAllManufacturers(
    manufacturerService: ManufacturerService,
): Promise<void> {
    const manufacturers = await manufacturerService.findAll();
    await Promise.all(
        manufacturers.map(manufacturer =>
            manufacturerService.delete(manufacturer.id),
        ),
    );
}
