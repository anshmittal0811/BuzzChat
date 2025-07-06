export const USERS_CONSTANTS = {
  PAGINATION: {
    ITEMS_PER_PAGE: 8,
    DEBOUNCE_DELAY: 300,
  },
  MESSAGES: {
    LOADING: "Loading...",
    NO_RESULTS: "No results.",
    FILTER_PLACEHOLDER: "Filter emails...",
    SHOWING_RESULTS: "Showing",
    OF: "of",
    NO_RESULTS_COUNT: "No results",
    PAGE: "Page",
  },
  BUTTONS: {
    PREVIOUS: "Previous",
    NEXT: "Next",
    SEND_MESSAGE: "Send Message",
    CONNECT: "Connect",
  },
  HEADERS: {
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    EMAIL: "Email",
    ACTION: "Action",
  },
} as const; 