export const CHAT_CONSTANTS = {
  APP_NAME: "BuzzChat",
  ROUTES: {
    AUTH: "/auth",
    ROOT: "/",
  },
  LABELS: {
    SHOW_USERS: "Show Users",
    LAST_SEEN: "last seen",
    ONLINE: "online",
    NONE: "none",
  },
  LAYOUT: {
    HEADER_HEIGHT: "10vh",
    CONTENT_HEIGHT: "92vh",
    SIDEBAR_FOOTER_PADDING: "p-5",
  },
  STYLES: {
    SIDEBAR_FOOTER_SHADOW: "0_-8px_25px_-15px_rgba(255,255,255,0.25)",
    BORDER_RADIUS: "rounded-t-xl",
  },
} as const;

export const CHAT_BREAKPOINTS = {
  MOBILE: 768,
} as const;

export const ANIMATION_DURATIONS = {
  SIDEBAR_TOGGLE: 300,
  LOADING_SCREEN: 500,
} as const; 