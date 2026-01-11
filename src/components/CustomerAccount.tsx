import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Order = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  comment?: string;
  items: { product: any; quantity: number }[];
  total: number;
  deliveryType: string;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  date: Date;
  customerEmail?: string;
};

type CustomerAccountProps = {
  customerEmail: string;
  orders: Order[];
  onLogout: () => void;
  onBackToShop: () => void;
};

const AUTH_API = 'https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100';

export default function CustomerAccount({ customerEmail, orders, onLogout, onBackToShop }: CustomerAccountProps) {
  const [localOrders, setLocalOrders] = useState(orders);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(parsed);
      setEditForm({
        name: parsed.full_name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        password: ''
      });
    }
  }, []);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders).map((o: any) => ({ ...o, date: new Date(o.date) }));
      setLocalOrders(parsed);
    }
  }, []);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const customerOrders = localOrders
    .filter(o => o.customerEmail === customerEmail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'completed': return 'Завершён';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="User" size={24} />
              <h1 className="text-xl font-heading font-bold">Личный кабинет</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onBackToShop}>
                <Icon name="Home" size={16} className="mr-2" />
                На сайт
              </Button>
              <Button variant="secondary" onClick={onLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-heading">Информация о профиле</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)}>
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentUser && (
              <>
                <div>
                  <span className="text-muted-foreground">ФИО: </span>
                  <span className="text-foreground font-medium">{currentUser.full_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="text-foreground font-medium">{currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div>
                    <span className="text-muted-foreground">Телефон: </span>
                    <span className="text-foreground font-medium">{currentUser.phone}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <h2 className="text-2xl font-heading font-bold mb-6">Мои заказы</h2>
        
        {customerOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">У вас пока нет заказов</p>
              <Button onClick={onBackToShop} className="mt-4">
                Начать покупки
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {customerOrders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Заказ #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Состав заказа:</p>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span>{item.product.price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Итого:</span>
                      <span>{order.total} ₽</span>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryType === 'delivery' ? `Доставка: ${order.address}` : 'Самовывоз'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование профиля</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">ФИО</Label>
              <Input
                id="profile-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="example@mail.ru"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Номер телефона</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+7 999 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-password">Новый пароль (оставьте пустым, если не нужно менять)</Label>
              <Input
                id="profile-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Введите новый пароль"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Отмена
            </Button>
            <Button onClick={async () => {
              try {
                const token = localStorage.getItem('authToken');
                const updateData: any = {
                  name: editForm.name,
                  email: editForm.email,
                  phone: editForm.phone
                };
                
                if (editForm.password) {
                  updateData.password = editForm.password;
                }
                
                const response = await fetch(`${AUTH_API}?action=profile`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(updateData)
                });
                
                if (response.ok) {
                  const data = await response.json();
                  localStorage.setItem('currentUser', JSON.stringify(data.user));
                  setCurrentUser(data.user);
                  toast({
                    title: 'Успешно',
                    description: 'Профиль обновлён'
                  });
                  setIsEditProfileOpen(false);
                } else {
                  const error = await response.json();
                  toast({
                    title: 'Ошибка',
                    description: error.error || 'Не удалось обновить профиль',
                    variant: 'destructive'
                  });
                }
              } catch (error) {
                console.error('Ошибка обновления профиля:', error);
                toast({
                  title: 'Ошибка',
                  description: 'Ошибка подключения к серверу',
                  variant: 'destructive'
                });
              }
            }}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}