import { Subjects } from "../subject"

export interface IUserDeactivedEvent {
    subject: Subjects.UserDeactived
    data: {
        id: string,
        isActive: boolean
    }
}

