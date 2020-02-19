import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Owner } from '../owner/owner.entity';

@Entity()
export class Car {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(
        () => Manufacturer,
        manufacturer => manufacturer.cars,
        { onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'manufacturer_id' })
    public manufacturer: Manufacturer;

    @OneToMany(
        () => Owner,
        owner => owner.car,
    )
    public owners: Owner[];

    @Column()
    public price: number;

    @Column({ default: 0 })
    public discountPercent: number;

    @Column({ name: 'first_registration_date', type: 'timestamptz' })
    public firstRegistrationDate: Date;

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
