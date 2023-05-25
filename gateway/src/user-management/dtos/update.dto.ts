import { IsBoolean, IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateDTO {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

}