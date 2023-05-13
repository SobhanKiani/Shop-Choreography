import { Subjects } from "../subject"

export interface IAdminToUserEvent {
    subject: Subjects.AdminToUser
    data: {
        id: string,
    }
}

