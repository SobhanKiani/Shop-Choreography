import { Subjects } from "../subject"

export interface IUserDeletedEvent {
    subject: Subjects.UserDeleted
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

