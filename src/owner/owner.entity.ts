import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Car } from '../car/car.entity';

@Entity()
@Unique(['name'])
export class Owner {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column({
        name: 'purchase_date',
        type: 'timestamptz',
        default: () => 'now()',
    })
    public purchaseDate: Date;

    @ManyToOne(
        () => Car,
        car => car.owners,
        { onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'car_id' })
    public car: Car;

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
