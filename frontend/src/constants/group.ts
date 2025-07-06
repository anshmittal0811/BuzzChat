export const GROUP_CONSTANTS = {
  TITLES: {
    CREATE_GROUP: "Create Group",
    DESELECT_ALL: "Deselect All",
    CANCEL: "Cancel",
    CREATE: "Create",
  },
  MESSAGES: {
    DESCRIPTION: "Provide a group name and select users.",
    SUCCESS_TITLE: "Group Created Successfully!",
    SUCCESS_DESCRIPTION: "Your new group has been created and is ready to use",
    NO_USERS_FOUND: "No users found",
    ERROR_CREATING_GROUP: "Error creating group",
  },
  PLACEHOLDERS: {
    GROUP_NAME: "Enter group name",
    SEARCH_USERS: "Search users...",
  },
  VALIDATION: {
    GROUP_NAME_REQUIRED: "Group name is required",
    USERS_REQUIRED: "At least one user must be selected",
  },
  UI: {
    DESKTOP_BREAKPOINT: 768,
    SEARCH_DEBOUNCE_MS: 300,
    MAX_USERS_PER_PAGE: 10,
    SCROLL_AREA_HEIGHT: "max-h-60",
  },
} as const;

export const GROUP_FORM_VALIDATION = {
  groupName: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  selectedUsers: {
    required: true,
    minLength: 1,
  },
} as const; 