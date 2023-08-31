import { User } from "src/auth/entities/auth.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    category: string;

    @Column()
    file_name: string;

    @Column({
        type: 'bytea',
    })
    data: Uint8Array;

    @Column()
    created_by: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;
}