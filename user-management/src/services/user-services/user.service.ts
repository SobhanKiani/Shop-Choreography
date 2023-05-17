import { Inject, Injectable } from "@nestjs/common";
import { Password } from '../../entities/user/value-objects'
import { UserEntity } from "../../entities/user/user";
import { Prisma, User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { JWTPayload } from "../../jwt/jwt-payload";
import { UserRepository } from "../../repositories/user.repository";

@Injectable()
export class UserService {
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository
    ) { }

    async signUp(createData: Prisma.UserCreateInput): Promise<{ userEntity: UserEntity, token: string }> {
        const pass = await new Password(createData.password).getHashedValue();
        const finalCreateData: Prisma.UserCreateInput = {
            ...createData,
            password: pass
        }
        const userEntity = await this.userRepository.createUser(finalCreateData)
        const token = await userEntity.createTokenForUser(this.jwtService)
        return {
            token,
            userEntity: userEntity
        };
    }

    async login(params: { email: string, password: string }): Promise<{ userEntity: UserEntity, token: string } | null> {
        const { email, password } = params
        const userEntity = await this.getUserByEmail(email);
        if (!userEntity) {
            return null;
        }

        if (!await userEntity.isGivenPasswordValid(password)) {
            return null;
        }

        const token = await this.createTokenForUser(userEntity)
        return {
            token,
            userEntity
        }
    }

    async updateUser(id, updateData: Prisma.UserUpdateInput): Promise<UserEntity | null> {
        const userEntity = await this.userRepository.getUserById(id);
        if (!userEntity) {
            return null;
        }

        userEntity.setValues(updateData);
        const updatedUserEntity = await this.userRepository.updateUser(userEntity)
        return updatedUserEntity;
    }

    async deleteUser(id: string): Promise<UserEntity | null> {
        const userEntity = await this.userRepository.deleteUser(id);
        return userEntity;
    }

    async getUserById(id: string): Promise<UserEntity | null> {
        const userEntity = await this.userRepository.getUserById(id);
        return userEntity;
    }

    async getUserByEmail(email: string): Promise<UserEntity | null> {
        const userEntity = this.userRepository.getUserByEmail(email);
        return userEntity;
    }

    // for login
    async compareUserPassword(user: UserEntity, password: string) {
        return await user.isGivenPasswordValid(password);
    }

    // for signUp
    // async createTokenForUser(user: UserEntity) {
    //     return await user.createTokenForUser(this.jwtService);
    // }

    async verifyUser(token: string, roles?: string[]) {
        const decodedToken = this.jwtService.decode(token) as JWTPayload;
        if (!decodedToken || !decodedToken.id) {
            return null;
        }
        const userEntity = await this.getUserById(decodedToken.id)

        if (roles && roles.length > 0 && userEntity.hasRoles(roles)) {
            return userEntity;
        }
    }

    async makeUserAdmin(id) {
        const userEntity = await this.userRepository.getUserById(id);

        if (!userEntity) {
            return null;
        }

        userEntity.makeUserAdmin()
        const updatedEntity = await this.userRepository.makeUserAdmin(userEntity);
        return updatedEntity;
    }

    async removeAdminRoleFromUser(id: string): Promise<UserEntity | null> {
        const userEntity = await this.userRepository.getUserById(id);
        if (!userEntity) {
            return null;
        }

        userEntity.removeAdminRole();
        const updatedEntity = await this.userRepository.removeAdminRoleFromUser(userEntity)
        return updatedEntity;
    }


    async toggleUserIsActive(id: string): Promise<UserEntity | null> {
        const userEntity = await this.userRepository.getUserById(id);
        if (!userEntity) {
            return null;
        }
        userEntity.toggleIsActive()
        const updatedUserEntity = await this.userRepository.toggleUserIsActive(userEntity);
        return updatedUserEntity;
    }

    async createTokenForUser(userEntity: UserEntity) {
        return await this.jwtService.sign({ id: userEntity.getId(), email: userEntity.getEmail().getValue() });
    }

}