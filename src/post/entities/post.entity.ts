import { User } from "src/auth/entities/auth.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany } from "typeorm";
import { Comment } from "./comment.entity";

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
    image_url: string;

    @Column()
    created_by: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];
}