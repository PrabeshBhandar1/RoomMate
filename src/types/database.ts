// Base interfaces - these match your actual database
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'tenant';
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  rent: number;
  location: string;
  facilities: string[];
  images: string[];
  available: boolean;
  created_at: string;
  owner?: User;
}

export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ChatRoom {
  listing_id: string;
  other_user: User;
  last_message?: Message;
  unread_count: number;
}

// Simplified Supabase types to avoid never issues
export interface Database {
  public: {
    Tables: {
      users: {
        Row: any; // Use 'any' to avoid never types
        Insert: any;
        Update: any;
      };
      listings: {
        Row: any;
        Insert: any;
        Update: any;
      };
      messages: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
  };
}