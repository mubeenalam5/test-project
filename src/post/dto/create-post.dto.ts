import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEnum } from "class-validator";
import { Category } from "../category.enum";

export class CreatePostDto {
    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(Category)
    category: string;

    // manualy set using multer file parameter and id from user_token
    file_name: string;

    data: Uint8Array;

    created_by: number;
}