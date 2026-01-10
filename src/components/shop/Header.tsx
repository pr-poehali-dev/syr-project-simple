import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { CartItem } from '@/components/types';

type HeaderProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setIsAuthOpen: (open: boolean) => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  deliveryType: string;
  setDeliveryType: (type: string) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  logo?: string;
  isAdmin?: boolean;
  onAdminClick?: () => void;
};

export default function Header({
  currentPage,
  setCurrentPage,
  setIsAuthOpen,
  cart,
  cartCount,
  cartTotal,
  updateQuantity,
  removeFromCart,
  deliveryType,
  setDeliveryType,
  setIsCheckoutOpen,
  logo,
  isAdmin = false,
  onAdminClick
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {logo && logo !== '🧀' ? (
              <img src={logo} alt="Логотип" className="w-12 h-12 object-contain" />
            ) : (
              <div className="text-3xl">🧀</div>
            )}
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
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAdminClick}
                className="relative"
              >
                <Icon name="Shield" size={16} className="mr-2" />
                Админ-панель
              </Button>
            )}
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
}