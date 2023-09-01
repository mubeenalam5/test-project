import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEnum, IsNumber } from "class-validator";
import { Category } from "../category.enum";

export class CommentDto {
    @ApiProperty()
    @IsNotEmpty()
    comment: string;

    @ApiProperty()
    @IsNumber()
    post_id: number;

    created_by: number;
}