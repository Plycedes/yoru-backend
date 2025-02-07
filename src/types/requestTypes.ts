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
