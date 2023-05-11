import { Injectable } from "@nestjs/common";
import { PrismaService } from "services/prisma-service/prisma-service.service";
import { Name, Address, Email, Password, Phone, Role } from 'src/Entities/User/value-objects'
import { UserEntity } from "src/Entities/User/user.entity";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { JWTPayload } from "jwt/jwt-payload";
import { ROLE_ENUM } from "utils/enums";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private jwtService: JwtService,) { }

    async createUser(name: string, address: string, email: string, password: string, phone: string, roles: string[]): Promise<UserEntity> {
        const pass = new Password(password);

        const user = await this.prisma.user.create({
            data: {
                name: name,
                address: address,
                phone: phone,
                email: email,
                password: await pass.getHashedValue(),
                roles: roles
            }
        })
        const userEntity = new UserEntity(user.id, user.name, user.email, user.password, user.address, user.phone, user.roles)
        return userEntity
    }

    async updateUser(id: string, name: string, address: string, email: string, phone: string, roles: string[]): Promise<UserEntity | null> {

        const args: Prisma.UserUpdateArgs = {
            where: { id: id },
            data: {
                name: name,
                address: address,
                email: email,
                phone: phone,
                roles: roles
            }
        }

        const updatedUser = await this.prisma.user.update(args)
        if (!updatedUser) {
            return null;
        }

        const userEntity = new UserEntity(updatedUser.id, updatedUser.name, updatedUser.email, updatedUser.password, updatedUser.address, updatedUser.phone, updatedUser.roles)
        return userEntity;
    }

    async deleteUser(id: string): Promise<UserEntity | null> {
        const args: Prisma.UserDeleteArgs = { where: { id: id } }
        const user = await this.prisma.user.delete(args);

        if (!user) {
            return null
        }

        const userEntity = new UserEntity(user.id, user.name, user.email, user.password, user.address, user.phone, user.roles)
        return userEntity;

    }

    async getUserById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            return null
        }

        const userEntity = new UserEntity(user.id, user.name, user.email, user.password, user.address, user.phone, user.roles);
        return userEntity;
    }

    async getUserByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return null
        }

        const userEntity = new UserEntity(user.id, user.name, user.email, user.password, user.address, user.phone, user.roles);
        return userEntity;
    }

    async compareUserPassword(user: UserEntity, password: string) {
        return await user.isGivenPasswordValid(password);
    }

    async createTokenForUser(user: UserEntity) {
        return await user.createTokenForUser(this.jwtService);
    }

    async decodeToken(token: string) {
        const decodedToken = this.jwtService.decode(token) as JWTPayload;
        if (!decodedToken || !decodedToken.id) {
            return null;
        }
        const user = this.getUserById(decodedToken.id)

        if (!user) {
            return null;
        }

        return user;
    }

    async makeUserAdmin(id) {
        const user = this.getUserById(id);
        if (!user) {
            return null;
        }

        this.prisma.user.update({
            where: { id: id },
            data: {
                roles: [
                    ROLE_ENUM.USER,
                    ROLE_ENUM.ADMIN
                ]
            }
        })

    }

}