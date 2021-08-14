import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { Product } from "./product";

@Entity()
export class Manufacturer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany((type) => Product, (product) => product.manufacturer, {
        nullable: true,
        cascade: true,
    })
    products: Product[];

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: { name: string }) {
        if (!options) {
            return;
        }
        this.name = options.name;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
