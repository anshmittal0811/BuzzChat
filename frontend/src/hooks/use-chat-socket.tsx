/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useChatSocket.ts
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  IAttachment,
  IGroup,
  IGroupCreatedPayload,
  IIncomingMessage,
  IUseChatSocketProps,
  IUser,
} from "@/types";
import { useAuth } from "@/contexts/auth-context";

export const useChatSocket = ({
  activeGroup,
  lastMessage,
  setGroupMessages,
  userMapRef,
  onGroupCreated,
  groupMembers,
}: IUseChatSocketProps) => {
  const { user, isLoading } = useAuth();
  const userRef = useRef<IUser | null>(user);
  const socketRef = useRef<Socket | null>(null);
  const [memberStatus, setMemberStatus] = useState<string>("");
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const activeGroupRef = useRef<IGroup | null>(activeGroup);
  const groupMemberRef = useRef<Record<string, IUser[]>>(groupMembers);
  const [groupStatus, setGroupStatus] = useState<Record<string, string>>();
  const [userGroupsStatus, setUserGroupsStatus] =
    useState<Record<string, string>>();

  useEffect(() => {
    activeGroupRef.current = activeGroup;
    setMemberStatus("");
    setUserGroupsStatus({
      ...userGroupsStatus,
      [activeGroup?._id ?? ""]: new Date().toISOString(),
    });
    if (activeGroup && socketRef?.current && socketRef?.current?.connected)
      socketRef.current?.emit(
        "group.lastseen.status",
        JSON.stringify({
          groupId: activeGroup?._id,
        })
      );
  }, [activeGroup]);

  useEffect(() => {
    if (lastMessage && socketRef?.current && socketRef?.current?.connected) {
      socketRef?.current?.emit(
        "chat.message.seen",
        JSON.stringify({
          groupId: activeGroup?._id,
          receiverId: lastMessage.sender._id,
          lastMessageTimestamp: lastMessage.createdAt,
        })
      );
      setUserGroupsStatus({
        ...userGroupsStatus,
        [activeGroup?._id ?? ""]: new Date().toISOString(),
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    groupMemberRef.current = groupMembers;
  }, [groupMembers]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    // Only connect if we don't already have a connected socket
    if (socketRef.current?.connected) {
      return;
    }
    
    // Need token to connect
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsSocketConnected(false);
      return;
    }

    // Wait until auth loading is complete before connecting
    if (isLoading) {
      return;
    }

    // Must have user data to proceed
    if (!user) {
      setIsSocketConnected(false);
      return;
    }


    // Clean up existing socket first (just in case)
    if (socketRef.current) {
      console.log("🧹 Cleaning up existing socket connection");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io("http://localhost:3001", {
      auth: { token },
      reconnection: true,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected at:", new Date().toISOString());
      setIsSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected at:", new Date().toISOString());
      setIsSocketConnected(false);
    });

    socket.on("connect_error", () => {
      console.error("Connection error at:", new Date().toISOString());
      setIsSocketConnected(false);
    });

    // Add more debugging for socket events
    socket.on("user.groups.status", (payload) => {
      setUserGroupsStatus(payload?.status);
    });

    socket.on("chat.message.incoming", (payload: IIncomingMessage) => {
      const { groupId, attachment, content, senderId } = payload;
      const _id = uuidv4();
      const now = new Date().toISOString();

      setGroupMessages((prev) => {
        const updated = { ...prev };
        updated[groupId] = [
          ...(updated[groupId] || []),
          {
            _id,
            attachment: attachment ?? null,
            content: content ?? null,
            sender: userMapRef.current[senderId],
            createdAt: now,
            updatedAt: now,
          },
        ];
        return updated;
      });
    });

    socket.on(
      "chat.message.seen",
      (payload: {
        groupId: string;
        lastMessageTimestamp: string;
        receiverId: string;
        senderId: string;
      }) => {
        if (payload.groupId === activeGroupRef.current?._id) {
          setGroupStatus((prev) => {
            const updated = { ...prev };
            updated[payload.senderId] = payload.lastMessageTimestamp;
            return updated;
          });
        }
      }
    );

    socket.on("group.status", (payload: { status: Record<string, string> }) => {
      setGroupStatus(payload?.status);
    });

    

    socket.on("user.status", (payload: { userId: string; status: string }) => {
      const { status } = payload;
      const currentTime = Date.now();
      const statusTimestamp = parseInt(status);
      const timeDifference = currentTime - statusTimestamp;
      
      // If status timestamp is within last 20 seconds (20000ms), set as online
      const actualStatus = timeDifference <= 20000 ? "online" : status;
      setMemberStatus(actualStatus);
      setIsSocketConnected(true);
    });

    socket.on("group.created", (payload: IGroupCreatedPayload) => {
      const { groupId, name, members, timestamp } = payload;
      console.log("New group created:", payload);

      const group: IGroup = {
        _id: groupId,
        name,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      members.forEach((member) => {
        userMapRef.current[member._id] = member;
      });

      if (onGroupCreated) {
        onGroupCreated(group, members);
        setUserGroupsStatus((prev) => {
          const updated = { ...prev };
          updated[group._id] = new Date(2020, 0, 1).toISOString();
          return updated;
        });
        setGroupStatus((prev) => {
          const updated = { ...prev };
          updated[group._id] = new Date(2020, 0, 1).toISOString();
          return updated;
        });
      }
    });

    const heartbeatInterval = setInterval(() => {
      socket.emit(
        "user.heartbeat",
        !activeGroupRef.current?.name
          ? JSON.stringify({
              memberId:
                groupMemberRef.current[activeGroupRef.current?._id ?? ""]?.find(
                  (member) => member._id !== userRef.current?._id
                )?._id ?? "",
            })
          : JSON.stringify({})
      );
    }, 20000);

    return () => {
      console.log("🧹 Cleaning up socket connection in useEffect cleanup");
      clearInterval(heartbeatInterval);
      
      // Remove all event listeners
      socket.off("chat.message.incoming");
      socket.off("chat.message.seen");
      socket.off("chat.message.deleted");
      socket.off("group.created");
      socket.off("group.status");
      socket.off("user.groups.status");
      socket.off("user.status");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      
      socket.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [user, isLoading]);

  const sendMessage = (
    content: string | null,
    attachment: IAttachment | null
  ) => {
    if (!socketRef.current || !user?._id) return;

    // Check if socket is connected, if not, reconnect it
    if (!socketRef.current.connected) {
      console.log("Socket disconnected, reconnecting...");
      socketRef.current.connect();
    }

    const _id = uuidv4();
    const now = new Date().toISOString();
    const trimmedContent = content?.trim() || null;

    setGroupMessages((prev) => {
      const updated = { ...prev };
      updated[activeGroup?._id ?? ""] = [
        ...(updated[activeGroup?._id ?? ""] || []),
        {
          _id,
          content: trimmedContent,
          attachment,
          sender: userMapRef.current[user._id],
          createdAt: now,
          updatedAt: now,
        },
      ];
      return updated;
    });

    const payload: {
      groupId: string;
      content?: string;
      attachment?: IAttachment;
    } = {
      groupId: activeGroup?._id || "",
    };

    if (trimmedContent) payload.content = trimmedContent;
    if (attachment) payload.attachment = attachment;

    socketRef.current.emit("chat.message.send", JSON.stringify(payload));
  };

  return { sendMessage, memberStatus, groupStatus, userGroupsStatus, isSocketConnected };
};
