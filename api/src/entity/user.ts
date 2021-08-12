import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({
        default: false
    })
    isAdmin: boolean;

    @Column({
        default: false
    })
    isSystemUser: boolean;

    @Column({
        default: false
    })
    isDisabled: boolean;

    @Column({ type: "int", default: 0 })
    balance: number;

    @Column({ select: false })
    password: string;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    public constructor(options?: {
        name: string;
        isAdmin?: boolean;
        isSystemUser?: boolean;
        isDisabled?: boolean;
        password: string;
    }) {
        if (!options) {
            return;
        }
        this.name = options.name;
        this.isAdmin = options.isAdmin;
        this.isSystemUser = options.isSystemUser;
        this.isDisabled = options.isDisabled;
        this.balance = 0;
        this.password = options.password;
        this.createdAt = String(Date.now());
        this.updatedAt = String(Date.now());
    }
}
