import { useChatPage } from "@/hooks/use-chat-page";
import { SocketLoadingScreen } from "@/components/ui/socket-loading";
import ChatLayout from "../../components/chat/ChatLayout";

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

const Chat = () => {
  const {
    shouldShowLoading,
    shouldShowSocketLoading,
    ...chatPageProps
  } = useChatPage();

  // Don't render anything if loading or not authenticated
  if (shouldShowLoading) {
    return null;
  }

  // Show loading screen if socket is not connected
  if (shouldShowSocketLoading) {
    return <SocketLoadingScreen />;
  }

  return <ChatLayout {...chatPageProps} />;
};

export default Chat;
