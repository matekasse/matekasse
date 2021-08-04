import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable
} from "typeorm";

import { Manufacturer } from "./manufacturer";

import { Tag } from "./tag";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({
        default: 0
    })
    bottleDepositInCents: number;

    @ManyToOne(type => Manufacturer, { nullable: true, eager: true })
    manufacturer: Manufacturer;

    @Column({
        default: 0
    })
    stock: number;

    @Column({
        default: 0
    })
    priceInCents: number;

    @Column({
        default: ""
    })
    description: string;

    @Column({
        default: false
    })
    isDisabled: boolean;

    @ManyToMany(
        type => Tag,
        Tag => Tag.products,
        {
            eager: true,
            // This does only work with mysql.
            onDelete: "CASCADE"
        }
    )
    @JoinTable()
    tags: Tag[];

    @Column({
        nullable: true
    })
    picture: string;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: {
        name: string;
        bottleDepositInCents: number;
        manufacturer?: Manufacturer;
        description?: string;
        priceInCents: number;
        isDisabled?: boolean;
        tags?: Tag[];
    }) {
        if (!options) {
            return;
        }
        this.name = options.name;
        this.bottleDepositInCents = options.bottleDepositInCents;
        this.manufacturer = options.manufacturer;
        this.description = options.description;
        this.stock = 0;
        this.priceInCents = options.priceInCents;
        this.tags = options.tags;
        this.isDisabled = options.isDisabled;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
