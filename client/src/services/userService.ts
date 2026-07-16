import { api } from '@/lib/axios';
import type { ManagedUser, UserRole } from '@/types';

export interface UserInput {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UserUpdateInput {
  fullName?: string;
  role?: UserRole;
  password?: string;
}

export const userService = {
  list: () => api.get<ManagedUser[]>('/users').then((r) => r.data),

  create: (data: UserInput) => api.post<ManagedUser>('/users', data).then((r) => r.data),

  update: (id: number, data: UserUpdateInput) =>
    api.put<ManagedUser>(`/users/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/users/${id}`),
};
