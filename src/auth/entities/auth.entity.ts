import { Crypt } from "src/common/encrypt";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Follower } from "./follower.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }

    @OneToMany(()=> Follower, (f) => f.followedUser)
    followers: Follower[];
    
    @OneToMany(()=> Follower, (f) => f.followerUser)
    followed: Follower[];
}