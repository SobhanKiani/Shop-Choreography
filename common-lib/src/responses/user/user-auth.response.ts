import { IBaseResponse } from "../base.response";

export interface IUserAuthReponse extends IBaseResponse {
    data: {
        user: {
            id?: string;
            name?: string;
            address?: string;
            phone?: string;
            email?: string;
            version?: number;
            isActive?: boolean;
            roles?: string[];
        },
        token: string
    } | null
}
