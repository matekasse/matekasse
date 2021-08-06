import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from "typeorm";

import { Product } from "./product";
import { User } from "./user";

@Entity()
export class WarehouseTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((type) => Product)
    product: Product;

    @ManyToOne((type) => User)
    user: User;

    @Column()
    quantity: number;

    @Column()
    pricePerItemInCents: number;

    @Column()
    depositPerItemInCents: number;

    @Column()
    totalInCents: number;

    @Column()
    totalDepositInCents: number;

    @Column()
    withCrate: boolean;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: {
        product: Product;
        user: User;
        quantity: number;
        pricePerItemInCents: number;
        depositPerItemInCents: number;
        totalInCents: number;
        totalDepositInCents: number;
        withCrate: boolean;
    }) {
        if (!options) {
            return;
        }
        this.product = options.product;
        this.user = options.user;
        this.quantity = options.quantity;
        this.pricePerItemInCents = options.pricePerItemInCents;
        this.depositPerItemInCents = options.depositPerItemInCents;
        this.totalInCents = options.totalInCents;
        this.totalDepositInCents = options.totalDepositInCents;
        this.withCrate = options.withCrate;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
