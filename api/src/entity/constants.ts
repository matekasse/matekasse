import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Constants {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 10000 })
    stornoTime: number;

    @Column({ default: 150 })
    crateDeposit: number;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: {
        stornoTime?: number;
        crateDeposit?: number;
    }) {
        if (!options) {
            return;
        }
        this.stornoTime = options.stornoTime;
        this.crateDeposit = options.crateDeposit;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
