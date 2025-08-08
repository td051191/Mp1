import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  Leaf, 
  Clock,
  ArrowRight,
  Heart,
  Plus
} from 'lucide-react';

export default function Index() {
  const featuredProducts = [
    {
      id: 1,
      name: "Organic Strawberries",
      price: 4.99,
      originalPrice: 6.99,
      image: "🍓",
      rating: 4.8,
      reviews: 127,
      badge: "Organic",
      badgeColor: "bg-fresh-green"
    },
    {
      id: 2,
      name: "Fresh Bananas",
      price: 2.49,
      originalPrice: null,
      image: "🍌",
      rating: 4.6,
      reviews: 89,
      badge: "Popular",
      badgeColor: "bg-fresh-yellow"
    },
    {
      id: 3,
      name: "Honeycrisp Apples",
      price: 3.99,
      originalPrice: 4.99,
      image: "🍎",
      rating: 4.9,
      reviews: 203,
      badge: "Premium",
      badgeColor: "bg-fresh-red"
    },
    {
      id: 4,
      name: "Fresh Oranges",
      price: 3.49,
      originalPrice: null,
      image: "🍊",
      rating: 4.7,
      reviews: 156,
      badge: "Vitamin C",
      badgeColor: "bg-fresh-orange"
    }
  ];

  const categories = [
    { name: "Tropical Fruits", emoji: "🥭", count: "25+ varieties", color: "bg-fresh-orange/10" },
    { name: "Berries", emoji: "🫐", count: "15+ varieties", color: "bg-fresh-purple/10" },
    { name: "Citrus", emoji: "🍋", count: "12+ varieties", color: "bg-fresh-yellow/10" },
    { name: "Stone Fruits", emoji: "🍑", count: "18+ varieties", color: "bg-fresh-red/10" },
    { name: "Organic", emoji: "🌱", count: "50+ varieties", color: "bg-fresh-green/10" },
    { name: "Exotic", emoji: "🥥", count: "20+ varieties", color: "bg-fresh-lime/10" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-fresh-green/5 via-fresh-lime/5 to-fresh-yellow/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-fresh-green text-white">🌱 100% Fresh & Organic</Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Fresh Fruits
                  <span className="block text-fresh-green">Delivered Daily</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Farm-fresh fruits delivered to your doorstep. Support local farmers while enjoying 
                  the finest quality produce at unbeatable prices.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Now
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-fresh-green" />
                  <span className="font-medium">Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-fresh-green" />
                  <span className="font-medium">Quality Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-fresh-green" />
                  <span className="font-medium">Same Day</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="text-9xl lg:text-[12rem] text-center opacity-90">
                🍎🍊🍌
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our wide selection of fresh produce, carefully sourced from local farms
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{category.emoji}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground">Hand-picked fresh fruits at the best prices</p>
            </div>
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card">
                <CardContent className="p-0">
                  <div className="relative p-6 text-center bg-gradient-to-br from-secondary/20 to-secondary/5">
                    <Badge className={`absolute top-3 left-3 ${product.badgeColor} text-white`}>
                      {product.badge}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <div className="text-8xl mb-4">{product.image}</div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-fresh-yellow fill-current' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-muted-foreground line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">per lb</span>
                    </div>
                    
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-fresh-green/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FreshMarket?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to delivering the freshest produce while supporting sustainable farming
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">100% Organic</h3>
              <p className="text-muted-foreground">
                All our products are certified organic, grown without harmful pesticides or chemicals
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-orange rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Same-day delivery available. Fresh from farm to your table in hours, not days
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guarantee</h3>
              <p className="text-muted-foreground">
                Not satisfied? We'll replace or refund your order, no questions asked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-fresh-green to-fresh-lime">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Fresh with Our Newsletter</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Get weekly updates on seasonal fruits, exclusive offers, and healthy recipes delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
            />
            <Button className="bg-white text-fresh-green hover:bg-white/90">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-fresh-green rounded-full">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">FreshMarket</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Fresh, organic produce delivered daily to your doorstep.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon">📘</Button>
                <Button variant="ghost" size="icon">📷</Button>
                <Button variant="ghost" size="icon">🐦</Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <div className="space-y-2">
                <Link to="/fruits" className="block text-muted-foreground hover:text-foreground">Fruits</Link>
                <Link to="/vegetables" className="block text-muted-foreground hover:text-foreground">Vegetables</Link>
                <Link to="/organic" className="block text-muted-foreground hover:text-foreground">Organic</Link>
                <Link to="/bundles" className="block text-muted-foreground hover:text-foreground">Bundles</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground">Contact Us</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">FAQ</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Shipping Info</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Returns</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>📞 +1 (555) 123-4567</p>
                <p>📧 hello@freshmarket.com</p>
                <p>📍 123 Farm Street, Fresh Valley</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 FreshMarket. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
