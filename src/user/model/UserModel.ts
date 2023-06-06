import { v4 as uuid } from 'uuid';

export class User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;

  constructor(name: string, lastName: string, email: string, password: string) {
    this.id = uuid();
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.createdAt = new Date().toISOString();
    this.isActive = false;
  }
}
