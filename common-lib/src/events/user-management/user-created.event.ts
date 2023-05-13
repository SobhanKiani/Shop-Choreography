import { Subjects } from "../subject"

export interface IUserCreatedEvent {
    subject: Subjects.UserCreated
    data: {
        id: string,
        name: string,
        address: string,
        phone: string,
        email: string,
        version: number,
        isActive: boolean
    }
}

