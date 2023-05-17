import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserEntity } from "../entities/user/user";


@Injectable()
export class UserFactory {
    public static create(user: User) {
        return new UserEntity(
            user.id,
            user.name,
            user.email,
            user.password,
            user.address,
            user.phone,
            user.roles,
            user.isActive,
            user.version || 0
        )
    }
}