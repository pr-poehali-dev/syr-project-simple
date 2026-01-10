import { useState } from 'react';
import AdminPanel from '@/components/AdminPanel';
import Header from '@/components/shop/Header';
import HomePage from '@/components/shop/HomePage';
import { AboutPage, FarmPage, DeliveryPage, ContactsPage } from '@/components/shop/InfoPages';
import CheckoutDialog from '@/components/shop/CheckoutDialog';
import CustomerAccount from '@/components/CustomerAccount';
import NotificationToast, { useNotifications } from '@/components/NotificationToast';
import AuthDialog from '@/components/AuthDialog';
import { Product, CartItem } from '@/components/types';
import { useDataLoader } from '@/hooks/useDataLoader';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useProductHandlers } from '@/hooks/useProductHandlers';

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
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    const saved = sessionStorage.getItem('currentCustomer');
    return saved ? JSON.parse(saved) : null;
  });
  const [showCustomerAccount, setShowCustomerAccount] = useState(() => {
    return sessionStorage.getItem('showCustomerAccount') === 'true';
  });
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

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useDataLoader(setProducts, setOrders, setSiteSettings);

  const { handleLogin: authLogin, handleRegister: authRegister } = useAuthHandlers({
    customers,
    setCustomers,
    setCurrentCustomer,
    setIsAdmin,
    setIsAuthOpen,
    setShowAdminPanel,
    setShowCustomerAccount,
    setRegisterData,
    setIsRegisterMode,
    addNotification
  });

  const { handleProductAdd, handleProductUpdate, handleProductDelete } = useProductHandlers({
    products,
    setProducts,
    addNotification
  });

  const addToCart = (product: Product, variant?: any) => {
    setCart(prev => {
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

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('home');
  };

  if (currentCustomer && showCustomerAccount) {
    return (
      <CustomerAccount
        customerEmail={currentCustomer.email}
        orders={orders}
        onLogout={() => {
          setCurrentCustomer(null);
          sessionStorage.removeItem('currentCustomer');
          setShowCustomerAccount(false);
          sessionStorage.removeItem('showCustomerAccount');
        }}
        onBackToShop={() => {
          setShowCustomerAccount(false);
          sessionStorage.setItem('showCustomerAccount', 'false');
        }}
      />
    );
  }

  if (isAdmin && showAdminPanel) {
    return (
      <AdminPanel
        products={products}
        orders={orders}
        onProductAdd={async (product) => {
          const newProduct = await handleProductAdd(product);
          if (newProduct) {
            setProducts([...products, newProduct]);
            addNotification('Товар добавлен и виден всем пользователям', 'success');
          }
        }}
        onProductUpdate={async (id, updates) => {
          const updated = await handleProductUpdate(id, updates, products);
          if (updated) {
            setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
            addNotification('Товар обновлён', 'success');
          }
        }}
        onProductDelete={async (id) => {
          const success = await handleProductDelete(id, addNotification);
          if (success) {
            setProducts(products.filter(p => p.id !== id));
          }
        }}
        onOrderUpdate={async (id, updates) => {
          const oldOrder = orders.find(o => o.id === id);
          const updatedOrder = { ...oldOrder, ...updates };
          
          try {
            const response = await fetch('https://functions.poehali.dev/20ab4828-3a5a-440b-a3f7-ac65b2f84748', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedOrder)
            });
            
            if (response.ok) {
              const newOrders = orders.map(o => o.id === id ? updatedOrder : o);
              setOrders(newOrders);
              
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
            }
          } catch (error) {
            console.error('Ошибка обновления заказа:', error);
          }
        }}
        onOrderDelete={async (id) => {
          try {
            const response = await fetch(`https://functions.poehali.dev/20ab4828-3a5a-440b-a3f7-ac65b2f84748?id=${id}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              setOrders(orders.filter(o => o.id !== id));
            }
          } catch (error) {
            console.error('Ошибка удаления заказа:', error);
          }
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

      <AuthDialog
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
        isRegisterMode={isRegisterMode}
        setIsRegisterMode={setIsRegisterMode}
        loginData={loginData}
        setLoginData={setLoginData}
        registerData={registerData}
        setRegisterData={setRegisterData}
        handleLogin={() => authLogin(loginData)}
        handleRegister={() => authRegister(registerData)}
      />

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
