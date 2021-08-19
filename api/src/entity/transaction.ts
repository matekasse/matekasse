import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

import { Product } from "./product";
import { User } from "./user";

export enum TransactionType {
    order = "order",
    storno = "storno",
    gift = "gift",
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((type) => User, { eager: true })
    fromUser: User;

    @ManyToOne((type) => User, { eager: true })
    toUser: User;

    @Column()
    amountOfMoneyInCents: number;

    @ManyToOne((type) => Product, { nullable: true, eager: true })
    product: Product;

    // Own implemented lazy loading
    @Column({ nullable: true })
    stornoOfTransactionID: string;

    stornoOfTransaction: Transaction;

    @Column({})
    typeOfTransaction: string;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: {
        fromUser: User;
        toUser: User;
        amountOfMoneyInCents: number;
        product?: Product;
        stornoOfTransactionID?: string;
        typeOfTransaction: string;
    }) {
        if (!options) {
            return;
        }
        this.fromUser = options.fromUser;
        this.toUser = options.toUser;
        this.amountOfMoneyInCents = options.amountOfMoneyInCents;
        this.product = options.product;
        this.stornoOfTransactionID = options.stornoOfTransactionID;
        this.typeOfTransaction = options.typeOfTransaction;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
