import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma-service/prisma-service.service";
import { UserEntity } from "../entities/user.entity";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "../factories/user.factory";

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(createData: Prisma.UserCreateInput): Promise<UserEntity> {
        const user = await this.prisma.user.create({
            data: {
                ...createData,
            }
        })
        const userEntity = UserFactory.create(user);
        return userEntity
    }

    async updateUser(userEntity: UserEntity): Promise<UserEntity | null> {
        const userEntityJson = userEntity.toObject();
        const updateData = {
            name: userEntityJson.name,
            address: userEntityJson.address,
            email: userEntityJson.email,
            phone: userEntityJson.phone,
            isActive: userEntityJson.isActive
        }
        const args: Prisma.UserUpdateManyArgs = {
            where: { id: userEntityJson.id, version: userEntityJson.version },
            data: {
                ...updateData,
                version: {
                    increment: 1
                }
            },
        }   

        const updatedUser = await this.prisma.user.updateMany(args);
        if (!updatedUser) {
            return null;
        }

        userEntity.incrementVersion()
        return userEntity;
    }

    async deleteUser(id: string): Promise<UserEntity | null> {
        const args: Prisma.UserDeleteArgs = { where: { id } }
        const user = await this.prisma.user.delete(args);

        if (!user) {
            return null
        }

        const userEntity = UserFactory.create(user);
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

        const userEntity = UserFactory.create(user);
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

        const userEntity = UserFactory.create(user);
        return userEntity;
    }

    async makeUserAdmin(userEntity: UserEntity) {
        await this.prisma.user.updateMany({
            where: { id: userEntity.getId(), version: userEntity.getVersionValue() },
            data: {
                roles: userEntity.getRolesStringList(),
                version: {
                    increment: 1
                }
            }
        })
        userEntity.incrementVersion()
        return userEntity;
    }

    async removeAdminRoleFromUser(userEntity: UserEntity): Promise<UserEntity | null> {
        await this.prisma.user.updateMany({
            where: { id: userEntity.getId(), version: userEntity.getVersionValue() },
            data: {
                roles: userEntity.getRolesStringList(),
                version: {
                    increment: 1,
                },
            },
        })[0];
        userEntity.incrementVersion()
        return userEntity;
    }


    async toggleUserIsActive(userEntity: UserEntity): Promise<UserEntity | null> {

        await this.prisma.user.updateMany({
            where: { id: userEntity.getId(), version: userEntity.getVersionValue() },
            data: {
                isActive: userEntity.isActive.getValue(),
                version: {
                    increment: 1,
                },
            },
        })[0];

        userEntity.incrementVersion()
        return userEntity;
    }

}