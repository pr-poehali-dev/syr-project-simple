import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

export default function CustomerAccount({ customerEmail, orders, onLogout, onBackToShop }: CustomerAccountProps) {
  const customerOrders = orders.filter(o => o.customerEmail === customerEmail);

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
            <CardTitle className="font-heading">Информация о профиле</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Email: <span className="text-foreground font-medium">{customerEmail}</span></p>
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
    </div>
  );
}
