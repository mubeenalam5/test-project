import { User } from "src/auth/entities/auth.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    comment: string;

    @Column()
    post_id: number;

    @ManyToOne(() => Post)
    @JoinColumn({ name: 'post_id' })
    post: Post;
    
    @Column()
    created_by: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;
}