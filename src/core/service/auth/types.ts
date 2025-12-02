export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  accessToken: string;
  refresh: string;
  user: User;
  app_version: string;
}

export type RegisterResponse = {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
  error?: boolean;
  message?: string;
};

// Internal User Interface (used in store)
export interface User {
  id: string;
  role?: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  modules?: string[];
  outlets?: Outlet[];
  phone?: string;
}

export interface Outlet {
  id: string;
  name: string;
  type: string;
  userRoleId: string;
}

// API Response Types
export interface ApiUser {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  app_version: string;
}

export type ProfileResponse = ApiUser;

export interface OutletItem {
  business_name: string | null;
  outlet_id: string | null;
  user_role_id: string;
}

export interface OutletResponse {
  msg: string;
  data: OutletItem[];
  pagination: any;
  error: boolean;
  app_version: string;
}
