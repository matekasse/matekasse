import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";

import { Product } from "./product";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany((type) => Product, (Product) => Product.tags, {
        nullable: true,
    })
    products: Promise<Product[]>;

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
