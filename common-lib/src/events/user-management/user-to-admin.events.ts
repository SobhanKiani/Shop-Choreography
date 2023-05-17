import { Subjects } from "../subject"

export interface IUserToAdminEvent {
    subject: Subjects.UserToAdmin
    data: {
        id: string,
        version: number,
    }
}

