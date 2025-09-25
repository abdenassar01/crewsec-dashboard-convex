
export type ApiResponse<T> = {
  message: string;
  status: number;
  data: T;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

export type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: "PARKING" | "RESTORER" | "ADMIN";
  enabled: boolean;
};

export type Parking = {
  id: number;
  name: string;
  description: string;
  location: string;
  image: string;
  website: string;
  address: string;
  user: User;
};

export type AuthResponse = {
  token: string;
  user: User;
};