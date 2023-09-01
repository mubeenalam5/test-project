import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEnum } from "class-validator";
import { Role } from "../role.enum";

export class SignUpDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: `Password Must Be Longer Than 8 Characters` })
    @MaxLength(20, { message: `Password Must Be Less Than 20 Characters` })
    // @Matches(/((?=.*[a-z])(?=.*[A-Z]))/, {message: `Password Must Contain Upper Case Letter & Lower Case Letters`})
    // @Matches(/((?=.*[0-9]))/, {message: `Password Must Contain a number from 0-9`})
    password: string;

    role: string;
}

export class AdminSignUpDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: `Password Must Be Longer Than 8 Characters` })
    @MaxLength(20, { message: `Password Must Be Less Than 20 Characters` })
    // @Matches(/((?=.*[a-z])(?=.*[A-Z]))/, {message: `Password Must Contain Upper Case Letter & Lower Case Letters`})
    // @Matches(/((?=.*[0-9]))/, {message: `Password Must Contain a number from 0-9`})
    password: string;

    role: string;
}

export class SignInDto {
    @ApiProperty({ required: true })
    @IsEmail()
    email: string;

    @ApiProperty({ required: true })
    @IsString()
    // @MinLength(8, {message: `Password Must Be Longer Than 8 Characters`})
    // @MaxLength(20, {message: `Password Must Be Less Than 20 Characters`})
    // @Matches(/((?=.*[a-z])(?=.*[A-Z]))/, {message: `Password Must Contain Upper Case Letter & Lower Case Letters`})
    // @Matches(/((?=.*[0-9]))/, {message: `Password Must Contain a number from 0-9`})
    password: string;
}