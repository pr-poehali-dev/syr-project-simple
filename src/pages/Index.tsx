import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminPanel from '@/components/AdminPanel';
import Header from '@/components/shop/Header';
import HomePage from '@/components/shop/HomePage';
import { AboutPage, FarmPage, DeliveryPage, ContactsPage } from '@/components/shop/InfoPages';
import CheckoutDialog from '@/components/shop/CheckoutDialog';
import CustomerAccount from '@/components/CustomerAccount';
import NotificationToast, { useNotifications } from '@/components/NotificationToast';
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
  customerEmail?: string;
};

type Customer = {
  email: string;
  password: string;
  name: string;
};

export default function Index() {
  const { notifications, addNotification, dismissNotification } = useNotifications();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [showCustomerAccount, setShowCustomerAccount] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved).map((o: any) => ({ ...o, date: new Date(o.date) })) : [];
  });
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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/94291b30-51cf-493d-8351-a3182150e773');
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    };
    
    const loadProducts = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100');
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setProducts(initialProducts);
            for (const product of initialProducts) {
              await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
              });
            }
            const reloadResponse = await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100');
            if (reloadResponse.ok) {
              const reloadedData = await reloadResponse.json();
              setProducts(reloadedData);
            }
          } else {
            setProducts(data);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        setProducts(initialProducts);
      }
    };
    
    loadSettings();
    loadProducts();
    
    const interval = setInterval(loadSettings, 10000);
    const productsInterval = setInterval(loadProducts, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(productsInterval);
    };
  }, []);

  const addToCart = (product: Product, variant?: any) => {
    setCart(prev => {
      const cartKey = variant ? `${product.id}-${variant.name}` : product.id.toString();
      const existing = prev.find(item => {
        if (variant) {
          return item.id === product.id && item.selectedVariant?.name === variant.name;
        }
        return item.id === product.id && !item.selectedVariant;
      });

      if (existing) {
        return prev.map(item => {
          if (variant) {
            return item.id === product.id && item.selectedVariant?.name === variant.name
              ? { ...item, quantity: item.quantity + 1 }
              : item;
          }
          return item.id === product.id && !item.selectedVariant
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }

      const cartItem = variant
        ? { 
            ...product, 
            price: variant.price, 
            weight: variant.weight,
            selectedVariant: variant, 
            quantity: 1 
          }
        : { ...product, quantity: 1 };

      return [...prev, cartItem];
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
      setShowAdminPanel(true);
    } else {
      const customer = customers.find(c => c.email === loginData.login && c.password === loginData.password);
      if (customer) {
        setCurrentCustomer(customer);
        setIsAuthOpen(false);
        setShowCustomerAccount(true);
      } else {
        alert('Неверный логин или пароль');
      }
    }
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password || !registerData.name) {
      alert('Заполните все поля');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      alert('Введите корректный email адрес');
      return;
    }
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const userConfirmed = window.confirm(
      `На email ${registerData.email} отправлен код подтверждения: ${verificationCode}\n\n` +
      `В реальной системе код придёт на почту. Для демонстрации:\n` +
      `Нажмите OK чтобы подтвердить, что это ваш email.`
    );
    
    if (!userConfirmed) {
      return;
    }
    
    const exists = customers.find(c => c.email === registerData.email);
    if (exists) {
      alert('Пользователь с таким email уже существует');
      return;
    }
    
    const newCustomer: Customer = { ...registerData };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setCurrentCustomer(newCustomer);
    setIsAuthOpen(false);
    setShowCustomerAccount(true);
    setRegisterData({ email: '', password: '', name: '' });
    setIsRegisterMode(false);
    addNotification('Регистрация успешна! Добро пожаловать!', 'success');
  };

  const handleProductAdd = async (product: Omit<Product, 'id'>) => {
    try {
      const response = await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
        addNotification('Товар добавлен и виден всем пользователям', 'success');
      }
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      alert('Ошибка добавления товара');
    }
  };

  const handleProductUpdate = async (id: number, updates: Partial<Product>) => {
    try {
      const updatedProduct = products.find(p => p.id === id);
      if (!updatedProduct) return;
      
      const response = await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedProduct, ...updates })
      });
      if (response.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
        addNotification('Товар обновлён', 'success');
      }
    } catch (error) {
      console.error('Ошибка обновления товара:', error);
    }
  };

  const handleProductDelete = async (id: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100?id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        addNotification('Товар удалён', 'info');
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('home');
  };

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (currentCustomer && showCustomerAccount) {
    return (
      <CustomerAccount
        customerEmail={currentCustomer.email}
        orders={orders}
        onLogout={() => {
          setCurrentCustomer(null);
          setShowCustomerAccount(false);
        }}
        onBackToShop={() => setShowCustomerAccount(false)}
      />
    );
  }

  if (isAdmin && showAdminPanel) {
    return (
      <AdminPanel
        products={products}
        orders={orders}
        onProductAdd={handleProductAdd}
        onProductUpdate={handleProductUpdate}
        onProductDelete={handleProductDelete}
        onOrderUpdate={(id, updates) => {
          const oldOrder = orders.find(o => o.id === id);
          const newOrders = orders.map(o => o.id === id ? { ...o, ...updates } : o);
          setOrders(newOrders);
          localStorage.setItem('orders', JSON.stringify(newOrders));
          
          if (oldOrder && updates.status && updates.status !== oldOrder.status && oldOrder.customerEmail) {
            const statusText = {
              'new': 'Новый',
              'preparing': 'Готовится',
              'ready': 'Готов к выдаче',
              'completed': 'Завершён'
            }[updates.status] || updates.status;
            
            addNotification(`Заказ #${id} — статус изменён на "${statusText}"`, 'success');
          }
          
          if (updates.total !== undefined && oldOrder && updates.total !== oldOrder.total) {
            addNotification(`Заказ #${id} — сумма обновлена: ${updates.total} ₽`, 'info');
          }
        }}
        onOrderDelete={(id) => {
          const newOrders = orders.filter(o => o.id !== id);
          setOrders(newOrders);
          localStorage.setItem('orders', JSON.stringify(newOrders));
        }}
        onSettingsUpdate={(settings) => {
          setSiteSettings(settings);
        }}
        onLogout={() => {
          setShowAdminPanel(false);
        }}
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
        isAdmin={isAdmin}
        onAdminClick={() => setShowAdminPanel(true)}
        isCustomer={!!currentCustomer}
        onCustomerAccountClick={() => setShowCustomerAccount(true)}
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

      <Dialog open={isAuthOpen} onOpenChange={(open) => {
        setIsAuthOpen(open);
        if (!open) setIsRegisterMode(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {isRegisterMode ? 'Регистрация' : 'Вход в личный кабинет'}
            </DialogTitle>
          </DialogHeader>
          {isRegisterMode ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Имя</Label>
                <Input
                  id="reg-name"
                  placeholder="Введите ваше имя"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Пароль</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Введите пароль"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleRegister}>Зарегистрироваться</Button>
              <Button variant="outline" className="w-full" onClick={() => setIsRegisterMode(false)}>
                Уже есть аккаунт? Войти
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email или логин</Label>
                <Input
                  id="email"
                  placeholder="example@mail.ru"
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
              <Button variant="outline" className="w-full" onClick={() => setIsRegisterMode(true)}>
                Регистрация
              </Button>
            </div>
          )}
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
        customerEmail={currentCustomer?.email}
      />

      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}