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
import { CreateOwnerDto, OwnerDto, UpdateOwnerDto } from './dto';
import { NOT_FOUND_MESSAGE } from './owner.constants';
import { OwnerService } from './owner.service';

@Controller('owners')
@ApiTags('owners')
export class OwnerController {
    constructor(private readonly ownerService: OwnerService) {}

    @Get()
    public async findAll(): Promise<OwnerDto[]> {
        const owners = await this.ownerService.findAll();

        return owners.map(owner => OwnerService.getDto(owner));
    }

    @Get(':id')
    public async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<OwnerDto> {
        const owner = await this.ownerService.findById(id);

        if (!owner) {
            throw new NotFoundException(NOT_FOUND_MESSAGE);
        }

        return OwnerService.getDto(owner);
    }

    @Post()
    public async create(@Body() payload: CreateOwnerDto): Promise<OwnerDto> {
        const owner = await this.ownerService.create(payload);

        return OwnerService.getDto(owner);
    }

    @Patch(':id')
    public async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateOwnerDto,
    ): Promise<OwnerDto> {
        const owner = await this.ownerService.update({
            id,
            payload,
        });

        return OwnerService.getDto(owner);
    }

    @HttpCode(204)
    @Delete(':id')
    public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.ownerService.delete(id);
    }
}
