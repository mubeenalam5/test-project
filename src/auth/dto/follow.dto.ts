import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class FollowDto {
    
    //  Set from token
    follower_id: number;

    @ApiProperty()
    @IsNotEmpty()
    followed_id: number;
}