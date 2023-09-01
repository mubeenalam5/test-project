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

    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;

    image_url: string;

    created_by: number;
}