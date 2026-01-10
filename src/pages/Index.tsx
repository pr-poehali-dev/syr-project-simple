import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import AdminPanel from '@/components/AdminPanel';
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

  const renderHeader = () => (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🧀</div>
            <div>
              <h1 className="text-xl font-heading font-bold text-primary">Сыроварня SOBKO</h1>
              <p className="text-xs text-muted-foreground">Натуральные продукты</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'home' ? 'text-primary' : 'text-foreground'
              }`}
            >
              Главная
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'about' ? 'text-primary' : 'text-foreground'
              }`}
            >
              О нас
            </button>
            <button
              onClick={() => {
                setCurrentPage('home');
                setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground"
            >
              Каталог
            </button>
            <button
              onClick={() => setCurrentPage('farm')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'farm' ? 'text-primary' : 'text-foreground'
              }`}
            >
              О нашей ферме
            </button>
            <button
              onClick={() => setCurrentPage('delivery')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'delivery' ? 'text-primary' : 'text-foreground'
              }`}
            >
              Доставка
            </button>
            <button
              onClick={() => setCurrentPage('contacts')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'contacts' ? 'text-primary' : 'text-foreground'
              }`}
            >
              Контакты
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAuthOpen(true)}
              className="relative"
            >
              <Icon name="User" size={20} />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Icon name="ShoppingCart" size={20} />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader>
                  <SheetTitle className="font-heading">Корзина</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4 flex-1 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Корзина пуста</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.weight}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Icon name="Minus" size={14} />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Icon name="Plus" size={14} />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{item.price * item.quantity} ₽</p>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 mt-2"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Итого:</span>
                          <span>{cartTotal} ₽</span>
                        </div>

                        <div className="space-y-3">
                          <Label>Способ получения</Label>
                          <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="delivery" id="delivery" />
                              <Label htmlFor="delivery" className="cursor-pointer">
                                Доставка (мин. сумма 2500 ₽)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pickup" id="pickup" />
                              <Label htmlFor="pickup" className="cursor-pointer">
                                Самовывоз
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {deliveryType === 'delivery' && cartTotal < 2500 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                            Минимальная сумма для доставки - 2500 ₽
                          </div>
                        )}

                        <Button
                          className="w-full"
                          size="lg"
                          disabled={deliveryType === 'delivery' && cartTotal < 2500}
                          onClick={() => setIsCheckoutOpen(true)}
                        >
                          Оформить заказ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );

  const renderHome = () => (
    <div className="space-y-12">
      <section className="relative bg-gradient-to-br from-secondary to-accent/30 rounded-3xl overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-heading font-bold mb-6 animate-fade-in">
              Сыроварня SOBKO — натуральные продукты с любовью и заботой о вашем здоровье!
            </h2>
            <p className="text-xl mb-8 text-muted-foreground animate-fade-in">
              Мы рады предложить вам широкий ассортимент свежих и вкусных продуктов, произведённых из молока нашего собственного фермерского хозяйства.
            </p>
            <Button size="lg" className="animate-scale-in" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
              Перейти к каталогу
            </Button>
          </div>
        </div>
      </section>

      <section id="catalog" className="container mx-auto px-4">
        <h3 className="text-3xl font-heading font-bold mb-8">Наши продукты</h3>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="all">Все товары</TabsTrigger>
            <TabsTrigger value="cheese">Сыры</TabsTrigger>
            <TabsTrigger value="dairy">Молочное</TabsTrigger>
            <TabsTrigger value="meat">Мясо</TabsTrigger>
            <TabsTrigger value="desserts">Десерты</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-heading font-semibold text-lg">{product.name}</h4>
                  <Badge variant="secondary">{product.weight}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  В наличии: {product.stock} шт
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{product.price} ₽</span>
                  <Button onClick={() => addToCart(product)}>
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    В корзину
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const renderAbout = () => (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">О нас</h2>
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          Мы рады предложить вам широкий ассортимент свежих и вкусных продуктов, произведённых из
          молока нашего собственного фермерского хозяйства. Каждая партия создаётся с вниманием к
          качеству и без использования искусственных добавок и консервантов — только чистая природа
          и традиционные рецепты.
        </p>
        <div>
          <h4 className="text-xl font-heading font-semibold mb-4">В нашем ассортименте вы найдёте:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🧀</span>
              <span>Разнообразные сыры — от нежных мягких до насыщенных твёрдых и выдержанных</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🥛</span>
              <span>Свежее молоко — натуральное и полезное</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🍶</span>
              <span>Творог, сметана, ацидофилин, кефир — идеальные продукты для здорового и сбалансированного питания</span>
            </li>
          </ul>
        </div>
        <div className="bg-secondary/50 rounded-2xl p-8 my-8">
          <p className="text-lg">
            Выбирая Сыроварню SOBKO, вы выбираете качество, натуральность и заботу о себе и своих близких. 
            Попробуйте наши продукты и убедитесь сами — вкус настоящего фермерского молока не сравнить ни с чем!
          </p>
        </div>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">Доставка и оплата</h2>
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Способы получения заказа</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Icon name="Truck" size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold">Доставка по городу</p>
                  <p className="text-muted-foreground">
                    Минимальная сумма заказа: 2500 ₽<br />
                    Доставка осуществляется 1-2 раза в неделю
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Package" size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold">Доставка по России</p>
                  <p className="text-muted-foreground">
                    Осуществляем доставку по России ТК СДЭК, ОЗОН
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Store" size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold">Самовывоз</p>
                  <p className="text-muted-foreground">
                    Любая сумма заказа<br />
                    Забрать можно в часы работы магазина
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Способы оплаты</h3>
            <div className="space-y-3">
              <p className="font-medium">При доставке:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>QR-код</li>
                <li>Наличные при получении</li>
              </ul>
              <p className="font-medium mt-4">При самовывозе:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Картой</li>
                <li>QR-кодом</li>
                <li>Наличными</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <p className="font-semibold mb-2">⚠️ Важно</p>
            <p className="text-sm">
              Обращаем ваше внимание, что сумма заказа, отображаемая в корзине, является
              предварительной. Окончательная стоимость может незначительно отличаться. Мы обязательно
              свяжемся с вами, чтобы сообщить точную сумму заказа перед тем, как он отправится к вам.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">Контакты</h2>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Icon name="MapPin" className="text-primary" />
              Адрес магазина
            </h3>
            <p className="text-lg mb-2">
              Краснокамск, ул. Геофизиков, 6<br />
              ТЦ "Добрыня", павильонный ряд
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Icon name="Clock" className="text-primary" />
              Режим работы
            </h3>
            <p className="text-lg">
              Пн-Пт: 10:30 - 19:00<br />
              Сб-Вс: 10:30 - 18:00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Icon name="Phone" className="text-primary" />
              Телефоны для связи
            </h3>
            <div className="space-y-2 text-lg">
              <p>
                <a href="tel:+79523224585" className="hover:text-primary transition-colors">
                  +7 (952) 322-45-85
                </a>{' '}
                — Ольга
              </p>
              <p>
                <a href="tel:+79026353303" className="hover:text-primary transition-colors">
                  +7 (902) 635-33-03
                </a>{' '}
                — Владимир
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Мы принимаем заказы только через сообщения сообщества. Если вам пишет менеджер с личного
              аккаунта и просит предоплату - это мошенники.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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
        onLogout={handleLogout}
      />
    );
  }

  const renderFarm = () => (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">О нашей ферме</h2>
      <div className="space-y-8 text-lg leading-relaxed">
        <div className="bg-secondary/30 rounded-2xl p-8">
          <h3 className="text-3xl font-heading font-bold mb-4 text-primary">От фермы — к вашему столу</h3>
          <p>
            Наша ферма — это живое сердце сыроварни SOBKO. Здесь, в экологически чистом уголке 
            Пермского края, рождается самое главное — безупречное сырье для наших продуктов.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-heading font-bold mb-6">Наши буренки — основа вкуса</h3>
          <p className="mb-6">
            Мы гордимся стадом из молочных пород, известных своим идеальным молоком:
          </p>

          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6">
              <h4 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐄</span> Джерсейская
              </h4>
              <p>
                Дает нежнейшее молоко с высоким содержанием белка и кальция. Оно сливочное и 
                ароматное — основа для наших сыров премиум-класса.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h4 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐄</span> Айрширская
              </h4>
              <p>
                Ее молоко сбалансированное и особенно полезное, идеально для творога, кефира и 
                классических сыров.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h4 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐄</span> Суксунская (красная горбатовская)
              </h4>
              <p>
                Наша местная гордость! Порода, адаптированная к уральскому климату, даёт целебное, 
                богатое витаминами молоко.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-lg font-medium">
            Все наши коровы питаются отборными травами и зерном. Мы знаем каждую по имени.
          </p>
        </div>

        <div className="bg-primary/10 rounded-2xl p-8 border-2 border-primary/20">
          <p className="text-lg">
            <strong>Мы не используем стимуляторы роста или антибиотики.</strong> Наша философия — 
            гармония с природой. Только так можно получить по-настоящему качественные, безопасные 
            и вкусные продукты от здоровых и счастливых животных.
          </p>
          <p className="mt-4 text-lg font-semibold text-primary">
            Это и есть наш секрет — любовь к земле и ответственность за тех, кого приручили.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}
      <main className="py-8">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'about' && renderAbout()}
        {currentPage === 'farm' && renderFarm()}
        {currentPage === 'delivery' && renderDelivery()}
        {currentPage === 'contacts' && renderContacts()}
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

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Оформление заказа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                placeholder="Иванов Иван Иванович"
                value={orderForm.fullName}
                onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                {deliveryType === 'delivery' ? 'Адрес доставки' : 'Способ получения'} <span className="text-red-500">*</span>
              </Label>
              {deliveryType === 'delivery' ? (
                <Input
                  id="address"
                  placeholder="Улица, дом, квартира"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  required
                />
              ) : (
                <Input
                  id="address"
                  value="Самовывоз из магазина"
                  disabled
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий к заказу</Label>
              <Input
                id="comment"
                placeholder="Пожелания к заказу"
                value={orderForm.comment}
                onChange={(e) => setOrderForm({ ...orderForm, comment: e.target.value })}
              />
            </div>
            <div className="border-t pt-4">
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium">Ваш заказ:</p>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-lg mb-4">
                <span>Итого:</span>
                <span>{cartTotal} ₽</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={async () => {
                if (!orderForm.fullName || !orderForm.phone || (deliveryType === 'delivery' && !orderForm.address)) {
                  alert('Пожалуйста, заполните все обязательные поля');
                  return;
                }

                const orderData = {
                  fullName: orderForm.fullName,
                  phone: orderForm.phone,
                  address: deliveryType === 'delivery' ? orderForm.address : 'Самовывоз',
                  comment: orderForm.comment,
                  items: cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    total: item.price * item.quantity
                  })),
                  total: cartTotal
                };

                const newOrder: Order = {
                  id: orders.length + 1,
                  customerName: orderForm.fullName,
                  phone: orderForm.phone,
                  address: deliveryType === 'delivery' ? orderForm.address : 'Самовывоз',
                  comment: orderForm.comment,
                  items: cart.map(item => ({ product: item, quantity: item.quantity })),
                  total: cartTotal,
                  deliveryType,
                  status: 'new',
                  date: new Date()
                };

                setOrders([...orders, newOrder]);

                try {
                  await fetch('https://functions.poehali.dev/b94615ae-f896-4593-b92c-4cab4c6e7b41', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      botToken: '8530330128:AAH7zYq7jWo-TdGIZStP3AMDL5s_-Jzbkcg',
                      chatId: '6368037525',
                      orderData
                    })
                  });
                } catch (error) {
                  console.error('Ошибка отправки уведомления:', error);
                }

                alert('Заказ оформлен! Мы свяжемся с вами в ближайшее время.');
                setIsCheckoutOpen(false);
                setOrderForm({ fullName: '', phone: '', address: '', comment: '' });
                setCart([]);
              }}
            >
              Подтвердить заказ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}