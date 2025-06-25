import api from "@/lib/api";

export const userService = {
    fetchUsers: (search: string, page: number, limit: number) =>
        api.get(`/users?${search?.length > 0 ? `search=${search}` : ''}&page=${page}&limit=${limit}`),
    fetchUserDetails: (userId: string) => api.get(`/users/${userId}`),
    updateProfileUrl: (profileUrl: string) => api.patch('/profile/image', { profileUrl })
};