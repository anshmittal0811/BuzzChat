import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Emoji picker state interface
 */
export interface EmojiPickerState {
  isVisible: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for managing emoji picker functionality
 * 
 * Handles emoji picker visibility, click outside detection,
 * and provides clean handlers for emoji selection.
 * 
 * @returns Object containing emoji picker state and handlers
 */
export const useEmojiPicker = () => {
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [emojiPickerState, setEmojiPickerState] = useState<EmojiPickerState>({
    isVisible: false,
    ref: emojiPickerRef,
  });

  /**
   * Toggles emoji picker visibility
   */
  const toggleEmojiPicker = useCallback(() => {
    setEmojiPickerState(prev => ({
      ...prev,
      isVisible: !prev.isVisible,
    }));
  }, []);

  /**
   * Hides the emoji picker
   */
  const hideEmojiPicker = useCallback(() => {
    setEmojiPickerState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  /**
   * Shows the emoji picker
   */
  const showEmojiPicker = useCallback(() => {
    setEmojiPickerState(prev => ({
      ...prev,
      isVisible: true,
    }));
  }, []);

  // Handle click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        hideEmojiPicker();
      }
    };

    if (emojiPickerState.isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerState.isVisible, hideEmojiPicker]);

  // Handle escape key to close emoji picker
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && emojiPickerState.isVisible) {
        hideEmojiPicker();
      }
    };

    if (emojiPickerState.isVisible) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [emojiPickerState.isVisible, hideEmojiPicker]);

  return {
    emojiPickerState,
    toggleEmojiPicker,
    hideEmojiPicker,
    showEmojiPicker,
  };
}; 