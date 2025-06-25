/* eslint-disable @next/next/no-img-element */
import Video from "next-video/player";
import { Check, CheckCheck, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IAttachment } from "@/types";
import extensionToIconMap from "@/constants/fileIconMap";
import { getFileExtension } from "@/utils";
import path from "path";

type MessageStatus = "sent" | "delivered" | "read";
type ResourceType = "image" | "video" | "pdf" | "raw";

interface IMessageBubbleProps {
  name: string | null;
  attachment?: IAttachment | null;
  content?: string | null;
  time: string;
  status: MessageStatus;
  isOutgoing?: boolean;
}

const getResourceType = (fileName: string): ResourceType => {
  const ext = path.extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) return "image";
  if ([".mp4", ".mov", ".avi", ".webm", ".mkv"].includes(ext)) return "video";
  if (ext === ".pdf") return "pdf";
  return "raw";
};

const ImageAttachment = ({ url, name }: { url: string; name: string }) => (
  <img
    src={url}
    className="w-60 h-60 rounded-lg bg-black"
    style={{ objectFit: "contain" }}
    alt={name}
  />
);

const VideoAttachment = ({ url }: { url: string }) => (
  <div className="flex justify-center items-center max-w-fit w-72 h-60 rounded-lg bg-black">
    <Video
      src={url}
      style={{
        "--media-secondary-color": "#F2AA4CFF",
        "--media-accent-color": "#F2AA4CFF",
      }}
    />
  </div>
);

const FileAttachment = ({ url, name }: { url: string; name: string }) => (
  <div className="w-60 h-20 rounded-lg bg-secondary p-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      {extensionToIconMap?.[getFileExtension(name) ?? ""]?.()}
      <span className="text-secondary-foreground text-sm font-medium truncate max-w-[120px]">
        {name}
      </span>
    </div>
    <a
      href={url}
      download={name}
      className="p-1 hover:bg-primary rounded-full transition-colors"
    >
      <Download className="h-5 w-5 text-secondary-foreground" />
    </a>
  </div>
);

const MessageStatus = ({ status }: { status: MessageStatus }) => {
  switch (status) {
    case "sent":
      return <Check className="h-4 w-4 text-gray-500" />;
    case "delivered":
      return <CheckCheck className="h-4 w-4 font-bold text-gray-500" />;
    case "read":
      return <CheckCheck className="h-4 w-4 text-primary" />;
  }
};

export default function MessageBubble({
  name,
  attachment,
  content,
  time,
  status,
  isOutgoing = true,
}: IMessageBubbleProps) {
  const renderAttachment = () => {
    if (!attachment?.url) return null;

    const resourceType = getResourceType(attachment.name);

    switch (resourceType) {
      case "image":
        return <ImageAttachment url={attachment.url} name={attachment.name} />;
      case "video":
        return <VideoAttachment url={attachment.url} />;
      case "pdf":
      case "raw":
        return <FileAttachment url={attachment.url} name={attachment.name} />;
    }
  };

  return (
    <div className={`flex flex-col ${attachment?.url ? "" : "max-w-[70%]"}`}>
      <Card
        className={`w-fit border-border ${
          isOutgoing ? "ml-auto bg-primary" : "mr-auto bg-secondary"
        }`}
      >
        {name && (
          <CardHeader className="py-2 px-3">
            <h3
              className={`text-sm font-medium ${
                isOutgoing ? "text-black" : "text-primary"
              }`}
            >
              {name}
            </h3>
          </CardHeader>
        )}
        <CardContent className="p-2">
          {renderAttachment()}
          {content && (
            <p
              className={`text-sm font-semibold break-words ${
                isOutgoing ? "text-black" : "text-white"
              } ${attachment?.url ? "mt-2 max-w-60" : ""}`}
            >
              {content}
            </p>
          )}
        </CardContent>
      </Card>
      <div
        className={`flex ${
          isOutgoing ? "justify-end" : "justify-start"
        } items-center gap-1 mt-1`}
      >
        <span className="text-xs text-gray-600">{time}</span>
        {isOutgoing && <MessageStatus status={status} />}
      </div>
    </div>
  );
}
