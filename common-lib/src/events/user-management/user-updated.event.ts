import { Subjects } from "../subject"

export interface IUserUdpatedEvent {
    subject: Subjects.UserUpdated
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

