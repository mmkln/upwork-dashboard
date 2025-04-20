// src/models/user.ts

export interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
}
