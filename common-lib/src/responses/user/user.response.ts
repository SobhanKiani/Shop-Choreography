import { IBaseResponse } from "../base.response";

export interface IUserResponse extends IBaseResponse {
    data: {
        id?: string,
        name?: string,
        address?: string,
        phone?: string,
        email?: string,
        version?: number,
        isActive?: boolean,
        roles?: string[],
    } | null
}