import { date, random } from 'faker';
import { Car } from '../../src/car/car.entity';
import { CarService } from '../../src/car/car.service';
import { CreateCarDto, UpdateCarDto } from '../../src/car/dto';
import { Manufacturer } from '../../src/manufacturer/manufacturer.entity';
import { getManufacturerMock } from '../manufacturer/utils';

export function getCarMock({
    manufacturer,
}: {
    manufacturer?: Manufacturer;
}): Car {
    return {
        id: random.number(),
        manufacturer: manufacturer || getManufacturerMock(),
        owners: [],
        price: random.number(),
        discountPercent: random.number({
            min: 0,
            max: 100,
        }),
        firstRegistrationDate: date.recent(),
        createdAt: date.recent(),
        updatedAt: date.recent(),
    };
}

export function getCreateCarDto({
    manufacturerId,
    firstRegistrationDate,
}: {
    manufacturerId?: number;
    firstRegistrationDate?: Date;
}): CreateCarDto {
    return {
        manufacturerId: manufacturerId || random.number(),
        firstRegistrationDate: firstRegistrationDate
            ? firstRegistrationDate.toISOString()
            : date.recent().toISOString(),
        price: random.number(),
    };
}

export function getUpdateCarDto({
    manufacturerId,
    firstRegistrationDate,
}: {
    manufacturerId?: number;
    firstRegistrationDate?: Date;
}): UpdateCarDto {
    return {
        manufacturerId,
        firstRegistrationDate: firstRegistrationDate
            ? firstRegistrationDate.toISOString()
            : date.recent().toISOString(),
        price: random.number(),
    };
}

export async function removeAllCars(carService: CarService): Promise<void> {
    const cars = await carService.findAll();
    await Promise.all(cars.map(car => carService.delete(car.id)));
}
