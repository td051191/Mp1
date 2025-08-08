import { 
  Product, 
  Category, 
  Content, 
  ProductsResponse, 
  CategoriesResponse, 
  ContentResponse 
} from '@shared/api';

const API_BASE = '/api';

// Products API
export const productsApi = {
  getAll: async (params?: {
    category?: string;
    featured?: boolean;
    organic?: boolean;
    seasonal?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.organic) searchParams.set('organic', 'true');
    if (params?.seasonal) searchParams.set('seasonal', 'true');
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);

    const response = await fetch(`${API_BASE}/products?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  getByCategory: async (categoryId: string): Promise<{ products: Product[]; total: number; categoryId: string }> => {
    const response = await fetch(`${API_BASE}/products/category/${categoryId}`);
    if (!response.ok) throw new Error('Failed to fetch products by category');
    return response.json();
  },

  getFeatured: async (limit: number = 4): Promise<ProductsResponse> => {
    return productsApi.getAll({ featured: true, limit });
  }
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<CategoriesResponse> => {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  getById: async (id: string): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  }
};

// Content API
export const contentApi = {
  getAll: async (params?: {
    section?: string;
    key?: string;
  }): Promise<ContentResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.section) searchParams.set('section', params.section);
    if (params?.key) searchParams.set('key', params.key);

    const response = await fetch(`${API_BASE}/content?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  },

  getByKey: async (key: string): Promise<Content> => {
    const response = await fetch(`${API_BASE}/content/key/${key}`);
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  },

  getBySection: async (section: string): Promise<{ content: Content[]; section: string; total: number }> => {
    const response = await fetch(`${API_BASE}/content/section/${section}`);
    if (!response.ok) throw new Error('Failed to fetch content by section');
    return response.json();
  }
};

// Newsletter API
export const newsletterApi = {
  subscribe: async (email: string, language: 'en' | 'vi' = 'en'): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, language }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to subscribe');
    }
    
    return response.json();
  }
};
