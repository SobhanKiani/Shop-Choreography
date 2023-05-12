// src/users/entities/user.entity.ts

import * as bcrypt from 'bcryptjs';
import { Address, Email, Name, Password, Phone, Role } from './value-objects';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsActive } from './value-objects/is-active.value-object';

@Injectable()
export class UserEntity {
    id: string;
    name: Name;
    password: Password | null;
    email: Email;
    address: Address;
    phone: Phone;
    roles: Role[] = [];
    isActive: IsActive;


    constructor(
        private readonly idValue: string,
        private readonly nameValue: string,
        private readonly emailValue: string,
        private readonly passwordValue: string | null,
        private readonly addressValue: string,
        private readonly phoneValue: string,
        private readonly rolesValue: string[],
        private readonly isActiveValue: boolean
    ) {
        this.id = idValue;
        this.password = new Password(passwordValue);
        this.name = new Name(this.nameValue);
        this.address = new Address(addressValue);
        this.phone = new Phone(phoneValue);
        for (let role of rolesValue) {
            this.roles.push(new Role(role))
        }
        this.isActive = new IsActive(isActiveValue)
    }


    public getId(): string {
        return this.id;
    }

    public getName(): Name {
        return this.name;
    }

    public getEmail(): Email {
        return this.email;
    }

    public getPassword(): Password {
        return this.password;
    }


    public getAddress(): Address {
        return this.address;
    }

    public getPhone(): Phone {
        return this.phone;
    }

    public getRole(): Role[] {
        return this.roles;
    }

    public async toJson() {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            phone: this.phone,
            password: await this.password.getHashedValue(),
            roles: this.roles,
            email: this.email,
        }
    }

    public getRolesStringList(): string[] {
        const roles = []
        for (let role of this.roles) {
            roles.push(role.getValue());
        }
        return roles;
    }

    public async isGivenPasswordValid(password: string) {
        return await bcrypt.compare(password, await this.password.getHashedValue());
    }

    public async createTokenForUser(jwtService: JwtService) {
        return await jwtService.sign({ id: this.id, email: this.email });
    }

}

