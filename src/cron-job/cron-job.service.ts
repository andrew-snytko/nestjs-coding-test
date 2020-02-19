import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CarService } from '../car/car.service';
import { OwnerService } from '../owner/owner.service';

@Injectable()
export class CronJobService {
    constructor(
        private readonly carService: CarService,
        private readonly ownerService: OwnerService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async handleCron(): Promise<void> {
        await this.carService.applyDiscount();
        await this.ownerService.removeOldRecords();
    }
}
