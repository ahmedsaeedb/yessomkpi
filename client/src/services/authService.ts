import { api } from '@/lib/axios';
import type { User } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
