import { Injectable } from "@nestjs/common";
import { PrismaService } from "services/prisma-service/prisma-service.service";
import { Password } from 'entities/user/value-objects'
import { UserEntity } from "entities/user/user.entity";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { JWTPayload } from "jwt/jwt-payload";
import { ROLE_ENUM } from "utils/enums";
import { create } from "domain";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private jwtService: JwtService,) { }

    async createUser(createData: Prisma.UserCreateInput): Promise<UserEntity> {

        const pass = await new Password(createData.password).getHashedValue();

        const user = await this.prisma.user.create({
            data: {
                ...createData,
                password: pass
            }
        })
        const userEntity = new UserEntity(
            user.id,
            user.name,
            user.email,
            user.password,
            user.address,
            user.phone,
            user.roles,
            user.isActive
        )
        return userEntity
    }

    async updateUser(id, updateData: Prisma.UserUpdateInput): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id }
        })

        if (!user) {
            return null
        }

        const args: Prisma.UserUpdateManyArgs = {
            where: { id: id, version: user.version },
            data: {
                ...updateData,
                version: {
                    increment: 1
                }
            },
        }

        const updatedUser = await this.prisma.user.updateMany(args)[0];
        if (!updatedUser) {
            return null;
        }

        const userEntity = new UserEntity(
            updatedUser.id,
            updatedUser.name,
            updatedUser.email,
            updatedUser.password,
            updatedUser.address,
            updatedUser.phone,
            updatedUser.roles,
            updatedUser.isActive
        )
        return userEntity;
    }

    async deleteUser(id: string): Promise<UserEntity | null> {
        const args: Prisma.UserDeleteArgs = { where: { id: id } }
        const user = await this.prisma.user.delete(args);

        if (!user) {
            return null
        }

        const userEntity = new UserEntity(
            user.id,
            user.name,
            user.email,
            user.password,
            user.address,
            user.phone,
            user.roles,
            user.isActive
        )
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

        const userEntity = new UserEntity(
            user.id,
            user.name,
            user.email,
            user.password,
            user.address,
            user.phone,
            user.roles,
            user.isActive
        );
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

        const userEntity = new UserEntity(
            user.id,
            user.name,
            user.email,
            user.password,
            user.address,
            user.phone,
            user.roles,
            user.isActive
        );
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
        const user = await this.prisma.user.findUnique({
            where: { id }
        })

        if (!user) {
            return null;
        }

        this.prisma.user.updateMany({
            where: { id: id, version: user.version },
            data: {
                roles: [
                    ROLE_ENUM.USER,
                    ROLE_ENUM.ADMIN
                ],
                version: {
                    increment: 1
                }
            }
        })
    }

    async removeAdminRoleFromUser(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return null;
        }

        const updatedUser = await this.prisma.user.updateMany({
            where: { id, version: user.version },
            data: {
                roles: {
                    set: [ROLE_ENUM.USER],
                },
                version: {
                    increment: 1,
                },
            },
        })[0];

        const userEntity = new UserEntity(
            updatedUser.id,
            updatedUser.name,
            updatedUser.email,
            updatedUser.password,
            updatedUser.address,
            updatedUser.phone,
            updatedUser.roles,
            updatedUser.isActive
        );

        return userEntity;
    }


    async toggleUserIsActive(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return null;
        }

        const updatedUser = await this.prisma.user.updateMany({
            where: { id, version: user.version },
            data: {
                isActive: !user.isActive,
                version: {
                    increment: 1,
                },
            },
        })[0];

        const userEntity = new UserEntity(
            updatedUser.id,
            updatedUser.name,
            updatedUser.email,
            updatedUser.password,
            updatedUser.address,
            updatedUser.phone,
            updatedUser.roles,
            updatedUser.isActive
        );

        return userEntity;
    }

}