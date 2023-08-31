
import { ManyToOne, Column, Entity, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { User } from "./auth.entity";

@Entity()
export class Follower {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    follower_id: number;

    @Column()
    followed_id: number;

    @ManyToOne(()=> User)
    @JoinColumn({name: 'follower_id'})
    followerUser: User;
    
    @ManyToOne(()=> User)
    @JoinColumn({name: 'followed_id'})
    followedUser: User;
}