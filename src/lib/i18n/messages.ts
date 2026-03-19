export const messages = {
  workspace: {
    create: {
      enterName: "Enter a workspace name",
      errorGeneric: "Something went wrong. Please try again.",
      getStarted: "Get started",
      joinLater: "Create a workspace. You can join others later via invite links.",
      formTitle: "Create workspace",
      namePlaceholder: "Workspace name",
      submit: "Create",
    },
    picker: {
      title: "Choose a workspace",
      placeholder: "Select a workspace",
    },
    notFound: {
      title: "Workspace not found",
      description: "This workspace does not exist or you don't have access.",
      back: "Back to workspaces",
    },
    detail: {
      contentPlaceholder: "Your workspace. Content goes here.",
    },
  },
  auth: {
    notSignedIn: "Not signed in. Please sign in and try again.",
    apiNotConfigured: "NEXT_PUBLIC_API_URL is not set. Check your environment.",
  },
  common: {
    errorGeneric: "Something went wrong. Please try again.",
  },
} as const;

export type MessageKey = keyof typeof messages;
