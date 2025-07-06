import { IMessage } from "@/types";
import { List } from "@/components/List";
import { SvgIcons } from "@/components/SvgIcons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageBubble from "@/components/MessageBubble";
import { getFriendlyDate, groupMessagesByDate } from "@/utils";
import { getInitials } from "@/utils";
import moment from "moment";


const MESSAGE_TIME_FORMAT = "hh:mm A";
/**
 * Message list component
 */
export const MessageList: React.FC<{
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