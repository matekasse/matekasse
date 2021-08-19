import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Constants {
    @PrimaryColumn()
    key: string;

    @Column()
    value: string;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: { key?: string; value?: string }) {
        if (!options) {
            return;
        }
        this.key = options.key;
        this.value = options.value;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
