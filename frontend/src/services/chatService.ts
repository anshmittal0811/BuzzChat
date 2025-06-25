import api from "@/lib/api";

export const chatService = {
    fetchGroups: () =>
        api.get('/groups'),
    createGroup: (name: string | null, memberIds: string[]) =>
        api.post(`/groups`, {
          ...(name !== null && { name }),
          memberIds,
        }),
    updateGroup: (groupId: string, name: string, imageUrl: string) =>
        api.patch(`/groups/${groupId}`, {
            ...(name !== null && { name }),
            ...(imageUrl !== null && { imageUrl }),
        }),
    deleteGroup: (groupId: string) =>
        api.delete(`/groups/${groupId}`),
};