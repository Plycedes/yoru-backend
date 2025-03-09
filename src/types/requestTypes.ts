import { networkInterfaces } from "node:os";
import { ParsedQs } from "qs";

export interface RegisterRequestBody {
    email: string;
    username: string;
    password: string;
}

export interface LoginRequestBody {
    email?: string;
    username?: string;
    password: string;
}

export interface ChangePasswordRequestBody {
    oldPassword: string;
    newPassword: string;
}

export interface CreateVideoBody {
    title: string;
    prompt: string;
}

export interface VideoIdType {
    vidId: string;
}

export interface PaginationType extends ParsedQs {
    page?: string;
    limit?: string;
    query?: string;
}

export interface LikesRequestBody {
    creatorId?: string;
    videoId: string;
}

export interface VideoRequestBody {
    videoId: string;
}

export interface CommentBody {
    comment?: string;
    videoId?: string;
    commentId?: string;
}
