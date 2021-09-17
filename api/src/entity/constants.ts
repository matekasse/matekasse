import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum ConstantType {
    stornoTime = "stornoTime",
    crateDeposit = "crateDeposit",
}

@Entity()
export class Constants {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 10000 })
    stornoTime: number;

    @Column({ default: 150 })
    crateDeposit: number;

    @Column({ default: "€" })
    currencySymbol: string;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: {
        stornoTime?: number;
        crateDeposit?: number;
        currencySymbol?: string;
    }) {
        if (!options) {
            return;
        }
        this.stornoTime = options.stornoTime;
        this.crateDeposit = options.crateDeposit;
        this.currencySymbol = options.currencySymbol;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
