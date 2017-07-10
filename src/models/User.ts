import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { BaseTenantEntity } from './BaseTenantEntity';
import { Role } from './Role';

@Entity()
export class User extends BaseTenantEntity{

    @Column({ nullable: false })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column()
    lastLogin: Date;

    @ManyToMany(type => Role, role => role.users, { 
        cascadeInsert: true, 
        cascadeUpdate: true
    })
    @JoinTable()
    roles: Role[];
}