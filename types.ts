
export enum ContentType {
  H1 = 'h1',
  H2 = 'h2',
  P = 'p',
  UL = 'ul',
  OL = 'ol',
  IMAGE = 'image',
  ALERT_INFO = 'alert_info',
  ALERT_WARNING = 'alert_warning',
}

export interface ContentBlock {
  id: string;
  type: ContentType;
  content: string | string[]; // string for most, string[] for lists
}

export interface Page {
  id: string;
  title: string;
  icon: (props: React.ComponentProps<'svg'>) => React.ReactNode;
  content?: ContentBlock[];
  children?: Page[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Suggestion {
  id: string;
  name: string;
  department: string;
  message: string;
  timestamp: string;
}

export interface User {
    username: string;
    role: 'admin' | 'user';
    password?: string; // Kept optional to not break currentUser, but will be enforced on creation
}

export type StoredUser = User & { password: string };


export interface AIMessage {
  role: 'user' | 'model';
  text: string;
}