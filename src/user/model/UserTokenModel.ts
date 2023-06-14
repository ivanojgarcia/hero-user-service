import { nanoid } from "nanoid";

export class UserToken {
  id: string;
  userId: string;
  email: string;
  refreshToken: string;
  expiresAt: number;

  constructor(userId: string, email: string, refreshToken: string, expiresAt: number) {
    this.id = nanoid();
    this.userId = userId;
    this.email = email;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
  }
}
