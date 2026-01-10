import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminPanel from '@/components/AdminPanel';
import Header from '@/components/shop/Header';
import HomePage from '@/components/shop/HomePage';
import { AboutPage, FarmPage, DeliveryPage, ContactsPage } from '@/components/shop/InfoPages';
import CheckoutDialog from '@/components/shop/CheckoutDialog';
import { Product, CartItem, products as initialProducts } from '@/components/types';

type Order = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  comment?: string;
  items: { product: Product; quantity: number }[];
  total: number;
  deliveryType: string;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  date: Date;
};

export default function Index() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    comment: ''
  });
  const [siteSettings, setSiteSettings] = useState({
    logo: '🧀',
    theme: 'default',
    farmPhotos: [] as string[]
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleLogin = () => {
    if (loginData.login === 'admmisSOBKO' && loginData.password === 'Sobko220!') {
      setIsAdmin(true);
      setIsAuthOpen(false);
    }
  };

  const handleProductAdd = (product: Omit<Product, 'id'>) => {
    const newId = Math.max(...products.map(p => p.id)) + 1;
    setProducts([...products, { ...product, id: newId }]);
  };

  const handleProductUpdate = (id: number, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleProductDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('home');
  };

  if (isAdmin) {
    return (
      <AdminPanel
        products={products}
        orders={orders}
        onProductAdd={handleProductAdd}
        onProductUpdate={handleProductUpdate}
        onProductDelete={handleProductDelete}
        onOrderUpdate={(id, updates) => {
          setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
        }}
        onOrderDelete={(id) => {
          setOrders(orders.filter(o => o.id !== id));
        }}
        onSettingsUpdate={(settings) => {
          setSiteSettings(settings);
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background" data-theme={siteSettings.theme}>
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setIsAuthOpen={setIsAuthOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        setIsCheckoutOpen={setIsCheckoutOpen}
        logo={siteSettings.logo}
      />
      
      <main className="py-8">
        {currentPage === 'home' && (
          <HomePage
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            addToCart={addToCart}
          />
        )}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'farm' && <FarmPage farmPhotos={siteSettings.farmPhotos} />}
        {currentPage === 'delivery' && <DeliveryPage />}
        {currentPage === 'contacts' && <ContactsPage />}
      </main>

      <footer className="bg-muted mt-20 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-3xl mb-4">🧀</div>
          <h3 className="text-xl font-heading font-bold mb-2">Сыроварня SOBKO</h3>
          <p className="text-muted-foreground mb-4">
            Натуральные сыры и молочные продукты
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://vk.com/sirovarnya_sobko"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-primary transition-colors"
            >
              ВКонтакте
            </a>
          </div>
        </div>
      </footer>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Вход в личный кабинет</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Логин</Label>
              <Input
                id="email"
                placeholder="Введите логин"
                value={loginData.login}
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>Войти</Button>
            <Button variant="outline" className="w-full">
              Регистрация
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        setIsOpen={setIsCheckoutOpen}
        cart={cart}
        cartTotal={cartTotal}
        deliveryType={deliveryType}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        orders={orders}
        setOrders={setOrders}
        setCart={setCart}
      />
    </div>
  );
}