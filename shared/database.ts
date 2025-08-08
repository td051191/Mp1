// Database schema interfaces for the fruit e-commerce platform

export interface Product {
  id: string;
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: { en: string; vi: string };
  badgeColor?: string;
  inStock: boolean;
  unit: string; // 'lb', 'kg', 'piece', etc.
  nutritionalInfo?: {
    calories: number;
    vitamin_c: number;
    fiber: number;
    sugar: number;
  };
  origin: string;
  isOrganic: boolean;
  isSeasonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  emoji: string;
  count: number;
  color: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  key: string; // unique identifier like 'hero_title', 'footer_text', etc.
  value: { en: string; vi: string };
  type: 'text' | 'html' | 'markdown';
  section: string; // 'hero', 'footer', 'features', etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface Newsletter {
  id: string;
  email: string;
  language: 'en' | 'vi';
  subscribedAt: Date;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string; // MD5 hash
  email?: string;
  fullName?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// API Response types
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ContentResponse {
  content: Content[];
}

// API Request types
export interface CreateProductRequest {
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: { en: string; vi: string };
  badgeColor?: string;
  unit: string;
  nutritionalInfo?: {
    calories: number;
    vitamin_c: number;
    fiber: number;
    sugar: number;
  };
  origin: string;
  isOrganic: boolean;
  isSeasonal: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CreateCategoryRequest {
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  emoji: string;
  color: string;
  slug: string;
  parentId?: string;
  sortOrder: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export interface CreateContentRequest {
  key: string;
  value: { en: string; vi: string };
  type: 'text' | 'html' | 'markdown';
  section: string;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  id: string;
}
