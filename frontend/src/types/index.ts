import { RefObject } from "react";

export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileUrl: string | null;
}

export interface IAttachment {
    url: string;
    type: string;
    name: string;
    size?: number;
}

export interface IMessage {
    _id: string;
    attachment?: IAttachment | null;
    content?: string | null;
    sender: IUser;
    createdAt: string;
    updatedAt: string;
}

export interface IIncomingMessage {
    groupId: string;
    senderId: string;
    attachment?: IAttachment;
    content?: string;
}

export interface IGroupCreatedPayload {
    groupId: string;
    name: string;
    createdBy: string;
    members: IUser[];
    imageUrl?: string;
    timestamp: string;
}

export interface IUseChatSocketProps {
    activeGroup: IGroup | null;
    lastMessage: IMessage | null;
    setGroupMessages: React.Dispatch<
        React.SetStateAction<Record<string, IMessage[]>>
    >;
    groupMembers: Record<string, IUser[]>;
    userMapRef: RefObject<Record<string, IUser>>;
    onGroupCreated?: (group: IGroup, members: IUser[]) => void;
}

export interface IChatThread {
    _id: string;
    name: string;
    lastMessage: IMessage;
    updatedAt: string;
    lastSeenAt?: string;
}

export interface IChatThreadItemProps {
    group: IGroup;
    newMessage: boolean;
}

export interface IChatUserProps {
    profileUrl: string;
    isGroup: boolean;
    name: string;
    lastMessage: string | null;
    lastSeen: string | null;
    date: string | null;
    newMessage?: boolean;
}

export interface IGroup {
    _id: string;
    name: string | null;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
}