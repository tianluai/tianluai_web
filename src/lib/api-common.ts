export const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type Workspace = {
  id: string;
  name: string;
  role?: string;
};
