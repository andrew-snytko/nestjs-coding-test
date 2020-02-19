import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Car } from '../car/car.entity';

@Entity()
@Unique(['name'])
export class Manufacturer {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public phone: string;

    @Column()
    public siret: number;

    @OneToMany(
        () => Car,
        car => car.manufacturer,
    )
    public cars: Car[];

    @UpdateDateColumn({
        name: 'updated_at',
        update: false,
        type: 'timestamptz',
    })
    public updatedAt: Date;

    @CreateDateColumn({
        name: 'created_at',
        update: false,
        type: 'timestamptz',
    })
    public createdAt: Date;
}
