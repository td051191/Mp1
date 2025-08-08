// In-memory database for the fruit e-commerce platform
// In production, this would be replaced with a real database like PostgreSQL

import { Product, Category, Content, Newsletter, AdminUser, AdminSession } from '@shared/database';
import crypto from 'crypto';

class MemoryDatabase {
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private content: Map<string, Content> = new Map();
  private newsletters: Map<string, Newsletter> = new Map();
  private adminUsers: Map<string, AdminUser> = new Map();
  private adminSessions: Map<string, AdminSession> = new Map();

  constructor() {
    this.seedData();
  }

  // Products
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  getProductsByCategory(category: string): Product[] {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  getFeaturedProducts(limit: number = 4): Product[] {
    return Array.from(this.products.values())
      .filter(p => p.inStock)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = this.generateId();
    const now = new Date();
    const product: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const product = this.products.get(id);
    if (!product) return null;

    const updatedProduct = {
      ...product,
      ...updates,
      id,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // Categories
  getAllCategories(): Category[] {
    return Array.from(this.categories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'count'>): Category {
    const id = this.generateId();
    const now = new Date();
    const category: Category = {
      ...categoryData,
      id,
      count: this.getProductsByCategory(id).length,
      createdAt: now,
      updatedAt: now
    };
    this.categories.set(id, category);
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const category = this.categories.get(id);
    if (!category) return null;

    const updatedCategory = {
      ...category,
      ...updates,
      id,
      updatedAt: new Date()
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  deleteCategory(id: string): boolean {
    return this.categories.delete(id);
  }

  // Content
  getAllContent(): Content[] {
    return Array.from(this.content.values());
  }

  getContentByKey(key: string): Content | undefined {
    return Array.from(this.content.values()).find(c => c.key === key);
  }

  getContentBySection(section: string): Content[] {
    return Array.from(this.content.values()).filter(c => c.section === section);
  }

  createContent(contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Content {
    const id = this.generateId();
    const now = new Date();
    const content: Content = {
      ...contentData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.content.set(id, content);
    return content;
  }

  updateContent(id: string, updates: Partial<Content>): Content | null {
    const content = this.content.get(id);
    if (!content) return null;

    const updatedContent = {
      ...content,
      ...updates,
      id,
      updatedAt: new Date()
    };
    this.content.set(id, updatedContent);
    return updatedContent;
  }

  deleteContent(id: string): boolean {
    return this.content.delete(id);
  }

  // Newsletter
  subscribeNewsletter(email: string, language: 'en' | 'vi'): Newsletter {
    const id = this.generateId();
    const newsletter: Newsletter = {
      id,
      email,
      language,
      subscribedAt: new Date(),
      isActive: true
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  // Admin Users
  createAdminUser(username: string, password: string, fullName?: string, email?: string): AdminUser {
    const id = this.generateId();
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    const now = new Date();

    const adminUser: AdminUser = {
      id,
      username,
      passwordHash,
      email,
      fullName,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    this.adminUsers.set(id, adminUser);
    return adminUser;
  }

  getAdminUserByUsername(username: string): AdminUser | undefined {
    return Array.from(this.adminUsers.values()).find(user => user.username === username);
  }

  getAdminUserById(id: string): AdminUser | undefined {
    return this.adminUsers.get(id);
  }

  updateAdminUserLastLogin(id: string): void {
    const user = this.adminUsers.get(id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      this.adminUsers.set(id, user);
    }
  }

  verifyAdminPassword(username: string, password: string): AdminUser | null {
    const user = this.getAdminUserByUsername(username);
    if (!user || !user.isActive) return null;

    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    if (user.passwordHash === passwordHash) {
      return user;
    }
    return null;
  }

  // Admin Sessions
  createAdminSession(userId: string): AdminSession {
    const id = this.generateId();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const session: AdminSession = {
      id,
      userId,
      token,
      expiresAt,
      createdAt: new Date()
    };

    this.adminSessions.set(token, session);
    return session;
  }

  getAdminSession(token: string): AdminSession | undefined {
    const session = this.adminSessions.get(token);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    // Clean up expired session
    if (session) {
      this.adminSessions.delete(token);
    }
    return undefined;
  }

  deleteAdminSession(token: string): boolean {
    return this.adminSessions.delete(token);
  }

  cleanExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.adminSessions.entries()) {
      if (session.expiresAt <= now) {
        this.adminSessions.delete(token);
      }
    }
  }

  // Utility
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Seed initial data
  private seedData(): void {
    // Seed categories
    const categories = [
      {
        name: { en: "Tropical Fruits", vi: "Trái cây nhiệt đới" },
        description: { en: "Fresh tropical fruits from exotic locations", vi: "Trái cây nhiệt đới tươi từ các vùng đất xa xôi" },
        emoji: "🥭",
        color: "bg-fresh-orange/10",
        slug: "tropical",
        isActive: true,
        sortOrder: 1
      },
      {
        name: { en: "Berries", vi: "Quả mọng" },
        description: { en: "Antioxidant-rich berries for your health", vi: "Quả mọng giàu chất chống oxy hóa cho sức khỏe" },
        emoji: "🫐",
        color: "bg-fresh-purple/10",
        slug: "berries",
        isActive: true,
        sortOrder: 2
      },
      {
        name: { en: "Citrus", vi: "Trái cây họ cam chanh" },
        description: { en: "Vitamin C packed citrus fruits", vi: "Trái cây họ cam chanh giàu vitamin C" },
        emoji: "🍋",
        color: "bg-fresh-yellow/10",
        slug: "citrus",
        isActive: true,
        sortOrder: 3
      },
      {
        name: { en: "Stone Fruits", vi: "Trái cây có hạt cứng" },
        description: { en: "Juicy stone fruits perfect for summer", vi: "Trái cây có hạt cứng ngon ngọt hoàn hảo cho mùa hè" },
        emoji: "🍑",
        color: "bg-fresh-red/10",
        slug: "stone-fruits",
        isActive: true,
        sortOrder: 4
      }
    ];

    categories.forEach(cat => {
      const id = this.generateId();
      const now = new Date();
      this.categories.set(id, {
        ...cat,
        id,
        count: 0,
        createdAt: now,
        updatedAt: now
      });
    });

    // Get category IDs for products
    const tropicalId = Array.from(this.categories.values()).find(c => c.slug === 'tropical')?.id!;
    const berriesId = Array.from(this.categories.values()).find(c => c.slug === 'berries')?.id!;
    const citrusId = Array.from(this.categories.values()).find(c => c.slug === 'citrus')?.id!;

    // Seed products
    const products = [
      {
        name: { en: "Organic Strawberries", vi: "Dâu tây hữu cơ" },
        description: { en: "Fresh organic strawberries, perfect for desserts", vi: "Dâu tây hữu cơ tươi, hoàn hảo cho món tráng miệng" },
        price: 4.99,
        originalPrice: 6.99,
        image: "🍓",
        category: berriesId,
        rating: 4.8,
        reviews: 127,
        badge: { en: "Organic", vi: "Hữu cơ" },
        badgeColor: "bg-fresh-green",
        inStock: true,
        unit: "lb",
        origin: "California, USA",
        isOrganic: true,
        isSeasonal: true,
        nutritionalInfo: {
          calories: 32,
          vitamin_c: 89,
          fiber: 2,
          sugar: 4.9
        }
      },
      {
        name: { en: "Fresh Bananas", vi: "Chuối tươi" },
        description: { en: "Sweet and creamy bananas, great for smoothies", vi: "Chuối ngọt và mềm, tuyệt vời cho sinh tố" },
        price: 2.49,
        image: "🍌",
        category: tropicalId,
        rating: 4.6,
        reviews: 89,
        badge: { en: "Popular", vi: "Phổ biến" },
        badgeColor: "bg-fresh-yellow",
        inStock: true,
        unit: "lb",
        origin: "Ecuador",
        isOrganic: false,
        isSeasonal: false,
        nutritionalInfo: {
          calories: 89,
          vitamin_c: 10,
          fiber: 2.6,
          sugar: 12
        }
      },
      {
        name: { en: "Honeycrisp Apples", vi: "Táo Honeycrisp" },
        description: { en: "Crisp and sweet apples with amazing crunch", vi: "Táo giòn và ngọt với độ giòn tuyệt vời" },
        price: 3.99,
        originalPrice: 4.99,
        image: "🍎",
        category: citrusId,
        rating: 4.9,
        reviews: 203,
        badge: { en: "Premium", vi: "Cao cấp" },
        badgeColor: "bg-fresh-red",
        inStock: true,
        unit: "lb",
        origin: "Washington, USA",
        isOrganic: false,
        isSeasonal: true,
        nutritionalInfo: {
          calories: 52,
          vitamin_c: 5,
          fiber: 2.4,
          sugar: 10
        }
      },
      {
        name: { en: "Fresh Oranges", vi: "Cam tươi" },
        description: { en: "Juicy oranges packed with vitamin C", vi: "Cam ngon ngọt giàu vitamin C" },
        price: 3.49,
        image: "🍊",
        category: citrusId,
        rating: 4.7,
        reviews: 156,
        badge: { en: "Vitamin C", vi: "Vitamin C" },
        badgeColor: "bg-fresh-orange",
        inStock: true,
        unit: "lb",
        origin: "Florida, USA",
        isOrganic: false,
        isSeasonal: false,
        nutritionalInfo: {
          calories: 47,
          vitamin_c: 92,
          fiber: 2.4,
          sugar: 9
        }
      }
    ];

    products.forEach(prod => {
      const id = this.generateId();
      const now = new Date();
      this.products.set(id, {
        ...prod,
        id,
        createdAt: now,
        updatedAt: now
      });
    });

    // Update category counts
    this.categories.forEach((category, id) => {
      const count = this.getProductsByCategory(id).length;
      this.categories.set(id, { ...category, count });
    });

    // Seed content
    const content = [
      {
        key: "hero_title",
        value: { en: "Fresh Fruits Delivered Daily", vi: "Trái cây tươi giao hàng hàng ngày" },
        type: "text" as const,
        section: "hero"
      },
      {
        key: "hero_subtitle",
        value: { 
          en: "Farm-fresh fruits delivered to your doorstep. Support local farmers while enjoying the finest quality produce at unbeatable prices.", 
          vi: "Trái cây tươi từ trang trại giao đến tận nhà. Hỗ trợ nông dân địa phương đồng thời thưởng thức sản phẩm chất lượng cao nhất với giá cả không thể cạnh tranh hơn." 
        },
        type: "text" as const,
        section: "hero"
      },
      {
        key: "features_title",
        value: { en: "Why Choose Minh Phát?", vi: "Tại sao chọn Minh Phát?" },
        type: "text" as const,
        section: "features"
      },
      {
        key: "newsletter_title",
        value: { en: "Stay Fresh with Our Newsletter", vi: "Luôn cập nhật với Bản tin của chúng tôi" },
        type: "text" as const,
        section: "newsletter"
      }
    ];

    content.forEach(cont => {
      const id = this.generateId();
      const now = new Date();
      this.content.set(id, {
        ...cont,
        id,
        createdAt: now,
        updatedAt: now
      });
    });
  }
}

// Export singleton instance
export const db = new MemoryDatabase();
