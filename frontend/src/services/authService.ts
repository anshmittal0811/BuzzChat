import api from "@/lib/api";

export const authService = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (firstName: string, lastName: string, email: string, password: string) =>
        api.post('/auth/register', { firstName, lastName, email, password }),
    refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken: refreshToken })
};