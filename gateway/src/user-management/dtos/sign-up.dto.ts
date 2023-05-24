import { IsBoolean, IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignUpDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

}