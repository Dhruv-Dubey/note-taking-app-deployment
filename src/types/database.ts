export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}