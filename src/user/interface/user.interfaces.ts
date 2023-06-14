export interface UserRecord {
    id: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
    password?: string;
}

export interface UserRequest extends UserRecord {
    password: string;
    confirmPassword: string;
}

export interface UserJWTData {
    id: string;
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    email: string;
    refresh_token: string;
}

export interface RefreshTokenResponse {
    id: string;
    userId: string;
    email: string;
    expiresAt: number,
    refreshToken: string;
}

export interface LoginResponse {
    token_type: string,
    access_token: string;
    refresh_token?: string;
    expires_in: number;
}