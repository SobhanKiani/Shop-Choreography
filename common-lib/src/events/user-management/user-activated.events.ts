import { Subjects } from "../subject"

export interface IUserActivedEvent {
    subject: Subjects.UserActived
    data: {
        id: string,
        isActive: boolean
    }
}

