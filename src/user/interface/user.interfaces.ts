export interface UserRecord {
    id: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
}

export interface UserRequest extends UserRecord {
    password: string;
    confirmPassword: string;
}