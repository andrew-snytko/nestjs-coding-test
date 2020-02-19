import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    CreateManufacturerDto,
    ManufacturerDto,
    UpdateManufacturerDto,
} from './dto';
import { NOT_FOUND_MESSAGE } from './manufacturer.constants';
import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturers')
@ApiTags('manufacturers')
export class ManufacturerController {
    constructor(private readonly manufacturerService: ManufacturerService) {}

    @Get()
    public async findAll(): Promise<ManufacturerDto[]> {
        const manufacturers = await this.manufacturerService.findAll();

        return manufacturers.map(manufacturer =>
            ManufacturerService.getDto(manufacturer),
        );
    }

    @Get(':id')
    public async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ManufacturerDto> {
        const manufacturer = await this.manufacturerService.findById(id);

        if (!manufacturer) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        return ManufacturerService.getDto(manufacturer);
    }

    @Post()
    public async create(
        @Body() payload: CreateManufacturerDto,
    ): Promise<ManufacturerDto> {
        const manufacturer = await this.manufacturerService.create(payload);

        return ManufacturerService.getDto(manufacturer);
    }

    @Patch(':id')
    public async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateManufacturerDto,
    ): Promise<ManufacturerDto> {
        const manufacturer = await this.manufacturerService.update({
            id,
            payload,
        });

        return ManufacturerService.getDto(manufacturer);
    }

    @HttpCode(204)
    @Delete(':id')
    public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.manufacturerService.delete(id);
    }
}
