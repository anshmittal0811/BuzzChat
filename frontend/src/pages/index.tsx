import Chat from "./chat";
import { AuthProvider } from "@/contexts/auth-context";
import { ChatProvider } from "@/contexts/chat-context";

export default function Home() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </AuthProvider>
  );
}
