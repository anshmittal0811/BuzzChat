import { IMessage } from "@/types";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export const useScroll = (
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
  