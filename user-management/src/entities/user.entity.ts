// src/users/entities/user.entity.ts

import * as bcrypt from 'bcryptjs';
// import { Address, Email, Name, Password, Phone, Role, IsActive, Version } from './value-objects';
import { JwtService } from '@nestjs/jwt';
import { ROLE_ENUM } from '../util/enums';
import { Address } from './value-objects/address.value-object';
import { Name } from './value-objects/name.value-object';
import { Password } from './value-objects/password.value-object';
import { Email } from './value-objects/email.value-object';
import { Phone } from './value-objects/phone.value-object';
import { Role } from './value-objects/role.value.object';
import { IsActive } from './value-objects/is-active.value-object';
import { Version } from './value-objects/version.value-object';


export class UserEntity {
    id: string;
    name: Name;
    password: Password | null;
    email: Email;
    address: Address;
    phone: Phone;
    roles: Role[] = [];
    isActive: IsActive;
    version: Version = new Version(0);


    constructor(
        private readonly idValue: string,
        private readonly nameValue: string,
        private readonly emailValue: string,
        private readonly passwordValue: string | null,
        private readonly addressValue: string,
        private readonly phoneValue: string,
        private readonly rolesValue: string[],
        private readonly isActiveValue: boolean,
        private readonly versionValue: number
    ) {
        this.id = idValue;
        this.password = new Password(passwordValue);
        this.email = new Email(emailValue)
        this.name = new Name(nameValue);
        this.address = new Address(addressValue);
        this.phone = new Phone(phoneValue);
        for (let role of rolesValue) {
            this.roles.push(new Role(role));
        }
        this.isActive = new IsActive(isActiveValue);
        this.version = new Version(versionValue);
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

    public getVersion(): Version {
        return this.version;
    }

    public getVersionValue(): number {
        return this.version.getValue();
    }

    public incrementVersion(): Version {
        const newVersion = new Version(this.version.getValue() + 1)
        this.version = newVersion;
        return this.version;
    }

    public toObject() {
        return {
            id: this.id,
            name: this.name.getValue(),
            address: this.address.getValue(),
            phone: this.phone.getValue(),
            roles: this.getRolesStringList(),
            email: this.email.getValue(),
            isActive: this.isActive.getValue(),
            version: this.getVersionValue()
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
        return await bcrypt.compare(password, this.password.getValue());
    }

    public async createTokenForUser(jwtService: JwtService) {
        return await jwtService.sign({ id: this.id, email: this.email });
    }

    public async toggleIsActive() {
        const oldIsActive = this.isActive.getValue();
        this.isActive = new IsActive(!oldIsActive)
        return this.isActive;
    }

    public setValues(obj: any) {
        if (obj.hasOwnProperty('id')) {
            this.id = obj.id;
        }
        if (obj.hasOwnProperty('name')) {
            this.name = new Name(obj.name);
        }
        if (obj.hasOwnProperty('email')) {
            this.email = new Email(obj.email);
        }
        if (obj.hasOwnProperty('password')) {
            this.password = new Password(obj.password);
        }
        if (obj.hasOwnProperty('address')) {
            this.address = new Address(obj.address);
        }
        if (obj.hasOwnProperty('phone')) {
            this.phone = new Phone(obj.phone);
        }
        if (obj.hasOwnProperty('roles')) {
            this.roles = obj.roles.map(role => new Role(role));
        }
        if (obj.hasOwnProperty('isActive')) {
            this.isActive = new IsActive(obj.isActive);
        }
    }

    public makeUserAdmin() {
        const newRole = new Role(ROLE_ENUM.ADMIN);
        this.roles.push(newRole);
        return this.roles;
    }

    public removeAdminRole() {
        const newRole = new Role(ROLE_ENUM.USER)
        this.roles = [newRole];
        return this.roles;
    }

    public hasRoles(roles: string[]) {
        const authorized = this.getRolesStringList().some((role) => roles.includes(role))
        return authorized
    }
}

