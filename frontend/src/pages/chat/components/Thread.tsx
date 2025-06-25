import { useMessages } from "@/hooks/use-messages";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List } from "@/components/List";
import { IMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { SvgIcons } from "@/components/SvgIcons";
import { useAuth } from "@/contexts/auth-context";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageBubble from "@/components/MessageBubble";
import { getFriendlyDate, getInitials, groupMessagesByDate } from "@/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import extensionToIconMap from "@/constants/fileIconMap";
import { Badge } from "@/components/ui/badge";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
} from "@/components/ui/emoji-picker";
import { useChat } from "@/contexts/chat-context";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEmojiPicker } from "@/hooks/use-emoji-picker";

// Constants
const SCROLL_ROOT_MARGIN = "400px 0px 0px 0px";
const MESSAGE_TIME_FORMAT = "hh:mm A";
const TEXTAREA_MIN_HEIGHT = 40;
const TEXTAREA_MAX_HEIGHT = 120;

/**
 * Custom hook for managing scroll behavior
 */
const useScrollManagement = (
  reversedItems: IMessage[],
  activeGroup: { _id?: string } | null
) => {
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>(0);

  // Reset scroll position when active group changes
  useEffect(() => {
    lastScrollDistanceToBottomRef.current = 0;
  }, [activeGroup]);

  // Maintain scroll position when new messages arrive
  useLayoutEffect(() => {
    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom =
      lastScrollDistanceToBottomRef.current ?? 0;

    if (scrollableRoot) {
      scrollableRoot.scrollTop =
        scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
    }
  }, [reversedItems]);

  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    }
  }, []);

  return {
    scrollableRootRef,
    handleRootScroll,
    lastScrollDistanceToBottomRef,
  };
};

/**
 * Custom hook for managing message status
 */
const useMessageStatus = () => {
  const { groupStatus, groupMembers, activeGroup } = useChat();

  const isMessageSeen = useCallback(
    (messageDate: string) => {
      const seenCount = Object.values(groupStatus || {}).filter(
        (lastSeenDate) => new Date(lastSeenDate) >= new Date(messageDate)
      ).length;

      const totalMembers = groupMembers[activeGroup?._id ?? ""]?.length || 0;
      return seenCount === totalMembers;
    },
    [groupStatus, groupMembers, activeGroup]
  );

  return { isMessageSeen };
};

/**
 * File attachment preview component
 */
const FileAttachmentPreview: React.FC<{
  file: File;
  extension: string | null;
  url: string | null;
  progress: number;
  onRemove: () => void;
  error: string | null;
}> = ({ file, extension, url, progress, onRemove, error }) => (
  <div className="relative flex flex-col p-5 gap-4 shadow-[0_-3px_5px_0_rgba(255,255,255,0.3)] rounded-t-2xl">
    <div className="flex flex-row w-full justify-between">
      <div className="flex flex-row items-center gap-3">
        {extension && extensionToIconMap?.[extension]?.()}
        <span className="text-white">{file.name}</span>
        {url && <SvgIcons.CheckIcon />}
        {error && <SvgIcons.CrossIcon />}
      </div>
      <button
        className="flex justify-center items-center w-5 h-5"
        onClick={onRemove}
        aria-label="Remove attachment"
      >
        <SvgIcons.CloseIcon />
      </button>
    </div>
    {!url && <Progress value={progress} className="w-full" />}
  </div>
);

/**
 * Emoji picker component
 */
const EmojiPickerComponent: React.FC<{
  isVisible: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  onEmojiSelect: (emojiData: { emoji: string }) => void;
}> = ({ isVisible, ref, onEmojiSelect }) => {
  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-12 left-0 z-50 h-96 border border-secondary rounded-lg bg-white"
    >
      <EmojiPicker onEmojiSelect={onEmojiSelect}>
        <EmojiPickerSearch placeholder="Search emojis..." />
        <EmojiPickerContent />
      </EmojiPicker>
    </div>
  );
};

/**
 * Message input component
 */
const MessageInput: React.FC<{
  content: string;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onEmojiToggle: () => void;
  showEmojiPicker: boolean;
  isMobile: boolean;
}> = ({
  content,
  onContentChange,
  onKeyDown,
  onEmojiToggle,
  showEmojiPicker,
  isMobile,
}) => (
  <div className="flex flex-row items-center w-full resize-none px-2 border border-secondary rounded-full shadow-sm text-white">
    <button
      type="button"
      onClick={onEmojiToggle}
      aria-label="Toggle emoji picker"
    >
      <SvgIcons.EmojiIcon color={showEmojiPicker ? "#F2AA4CFF" : "#ffffff"} />
    </button>
    <Textarea
      placeholder={!isMobile ? "Type your message... (Ctrl+Enter to send)" : ""}
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="w-full border-none resize-none outline-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-semibold placeholder:text-muted-foreground"
      style={{
        minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
        maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
      }}
      rows={1}
    />
  </div>
);

/**
 * Message list component
 */
const MessageList: React.FC<{
  reversedItems: IMessage[];
  canLoadMore: boolean;
  infiniteRef: React.Ref<HTMLUListElement>;
  user: { _id: string } | null;
  activeGroup: { _id?: string; name?: string | null } | null;
  isMessageSeen: (date: string) => boolean;
}> = ({
  reversedItems,
  canLoadMore,
  infiniteRef,
  user,
  activeGroup,
  isMessageSeen,
}) => (
  <>
    {canLoadMore && (
      <List ref={infiniteRef}>
        <div className="flex justify-center items-center w-full h-8 mb-5">
          <SvgIcons.LoadingSpinner />
        </div>
      </List>
    )}

    {groupMessagesByDate(reversedItems).map((group) => (
      <div key={group.date}>
        <div className="sticky top-0 z-50 mb-6 w-auto py-1 text-sm text-center">
          <Badge className="p-2.5 rounded-full bg-secondary pointer-events-none">
            {getFriendlyDate(group.date)}
          </Badge>
        </div>

        {group.messages.map((item: IMessage) => (
          <div
            className={`relative flex ${
              item.sender._id === user?._id ? "justify-end" : "justify-start"
            } mb-8`}
            key={item._id}
          >
            {item.sender._id !== user?._id && !!activeGroup?.name && (
              <Avatar className="mr-3">
                <AvatarImage
                  width={1}
                  height={1}
                  src={item?.sender?.profileUrl ?? undefined}
                />
                <AvatarFallback className="font-bold text-black bg-primary">
                  {getInitials(item?.sender)}
                </AvatarFallback>
              </Avatar>
            )}
            <MessageBubble
              name={
                item.sender._id !== user?._id
                  ? `${item?.sender?.firstName} ${item?.sender?.lastName}`
                  : null
              }
              attachment={item?.attachment}
              content={item?.content}
              time={moment(item?.createdAt).format(MESSAGE_TIME_FORMAT)}
              status={isMessageSeen(item?.createdAt) ? "read" : "delivered"}
              isOutgoing={item.sender._id === user?._id}
            />
          </div>
        ))}
      </div>
    ))}
  </>
);

/**
 * Main Thread component
 */
const Thread: React.FC = () => {
  const { user } = useAuth();
  const { activeGroup, groupMessages, sendMessage } = useChat();
  const messages = useMemo(
    () => groupMessages[activeGroup?._id ?? ""] || [],
    [groupMessages, activeGroup]
  );
  const isMobile = useIsMobile();

  // Custom hooks
  const {
    fileUploadState,
    fileInputRef,
    handleFileSelect,
    handleFileChange,
    clearFileUpload,
  } = useFileUpload();

  const { emojiPickerState, toggleEmojiPicker, hideEmojiPicker } =
    useEmojiPicker();

  const { isMessageSeen } = useMessageStatus();

  // Message loading
  const {
    loading,
    items: messagesItems,
    canLoadMore,
    error,
    loadMore,
    setItems,
  } = useMessages(activeGroup?._id ?? "", messages);

  // Infinite scroll
  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading,
    hasNextPage: canLoadMore,
    onLoadMore: loadMore,
    disabled: !!error,
    rootMargin: SCROLL_ROOT_MARGIN,
  });

  // Scroll management
  const { scrollableRootRef, handleRootScroll } = useScrollManagement(
    useMemo(() => [...messagesItems].reverse(), [messagesItems]),
    activeGroup
  );

  // Message content state
  const [content, setContent] = useState<string>("");

  // Root ref setter
  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef, scrollableRootRef]
  );

  // Update items when messages change
  useEffect(() => {
    setItems((prev) => {
      const prevKeys = new Set(prev.map((message) => message._id));
      const newOnes = messages?.filter((message) => !prevKeys.has(message._id));
      newOnes.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
      return [...newOnes, ...prev];
    });
  }, [messages, setItems, activeGroup]);

  // Message submission handlers
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedContent = content.trim();

      if (!trimmedContent && !fileUploadState.attachment) return;

      sendMessage(trimmedContent || null, fileUploadState.attachment);
      setContent("");
      clearFileUpload();
    },
    [content, fileUploadState.attachment, sendMessage, clearFileUpload]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmedContent = content.trim();

        if (!trimmedContent && !fileUploadState.attachment) return;

        sendMessage(trimmedContent || null, fileUploadState.attachment);
        setContent("");
        clearFileUpload();
      }
    },
    [content, fileUploadState.attachment, sendMessage, clearFileUpload]
  );

  const handleEmojiSelect = useCallback(
    (emojiData: { emoji: string }) => {
      setContent((prev) => prev + emojiData.emoji);
      hideEmojiPicker();
    },
    [hideEmojiPicker]
  );

  const reversedItems = useMemo(
    () => [...messagesItems].reverse(),
    [messagesItems]
  );

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Messages Container */}
      <div
        className="overflow-auto p-4 custom-scrollbar"
        ref={rootRefSetter}
        onScroll={handleRootScroll}
      >
        <MessageList
          reversedItems={reversedItems}
          canLoadMore={canLoadMore}
          infiniteRef={infiniteRef}
          user={user}
          activeGroup={activeGroup}
          isMessageSeen={isMessageSeen}
        />
      </div>

      {/* Input Container */}
      <div>
        {/* File Attachment Preview */}
        {fileUploadState.file && (
          <FileAttachmentPreview
            file={fileUploadState.file}
            extension={fileUploadState.extension}
            url={fileUploadState.url}
            progress={fileUploadState.progress}
            onRemove={clearFileUpload}
            error={fileUploadState.error}
          />
        )}

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Message Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-2 mb-4"
        >
          <Button
            type="button"
            className="text-white"
            onClick={handleFileSelect}
            aria-label="Attach file"
          >
            <SvgIcons.AttachmentIcon />
          </Button>

          <div className="relative">
            <EmojiPickerComponent
              isVisible={emojiPickerState.isVisible}
              ref={emojiPickerState.ref}
              onEmojiSelect={handleEmojiSelect}
            />
          </div>

          <MessageInput
            content={content}
            onContentChange={setContent}
            onKeyDown={handleKeyDown}
            onEmojiToggle={toggleEmojiPicker}
            showEmojiPicker={emojiPickerState.isVisible}
            isMobile={isMobile}
          />

          <Button type="submit" className="px-4 py-2" aria-label="Send message">
            <SvgIcons.SendIcon className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Thread;
