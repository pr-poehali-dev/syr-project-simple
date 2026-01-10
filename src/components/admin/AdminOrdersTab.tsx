import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Product } from '../types';

type Order = {
  id: number;
  customerName: string;
  phone?: string;
  address?: string;
  comment?: string;
  items: { product: Product; quantity: number }[];
  total: number;
  deliveryType: string;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  date: Date;
};

type AdminOrdersTabProps = {
  orders: Order[];
  onOrderUpdate: (id: number, updates: Partial<Order>) => void;
  onOrderDelete: (id: number) => void;
};

export default function AdminOrdersTab({ orders, onOrderUpdate, onOrderDelete }: AdminOrdersTabProps) {
  const parseWeight = (weightStr: string): number => {
    const match = weightStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const calculatePrice = (basePrice: number, originalWeight: string, newWeight: string): number => {
    const origGrams = parseWeight(originalWeight);
    const newGrams = parseWeight(newWeight);
    if (origGrams === 0) return basePrice;
    const pricePerGram = basePrice / origGrams;
    return Math.round(pricePerGram * newGrams);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-heading font-bold">Заказы клиентов</h2>
      <div className="space-y-4">
        {orders.map(order => {
          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Заказ #{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.customerName} • {order.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'ready' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'new' ? 'Новый' :
                     order.status === 'preparing' ? 'Готовится' :
                     order.status === 'ready' ? 'Готов' : 'Завершён'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-2">Контактная информация:</p>
                    <p className="text-sm">Телефон: {order.phone || 'Не указан'}</p>
                    <p className="text-sm">Адрес: {order.address || 'Не указан'}</p>
                    {order.comment && <p className="text-sm">Комментарий: {order.comment}</p>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Состав заказа:
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Измените вес — цена пересчитается автоматически)
                      </span>
                    </p>
                    {order.items.map((item, idx) => {
                      const originalWeight = (item.product as any).originalWeight || item.product.weight;
                      const originalPrice = (item.product as any).originalPrice || item.product.price;
                      const basePricePer100g = (originalPrice / parseWeight(originalWeight)) * 100;

                      return (
                        <div key={idx} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>Заказано: {originalWeight} за {originalPrice} ₽</span>
                                <span className="font-medium text-primary">
                                  {Math.round(basePricePer100g)} ₽/100г
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Вес факт.</Label>
                              <Input
                                type="text"
                                value={item.product.weight}
                                onChange={(e) => {
                                  const newWeight = e.target.value;
                                  const newPrice = calculatePrice(originalPrice, originalWeight, newWeight);
                                  
                                  const updatedItems = [...order.items];
                                  updatedItems[idx] = { 
                                    ...item, 
                                    product: { 
                                      ...item.product, 
                                      weight: newWeight,
                                      price: newPrice 
                                    }
                                  };
                                  const newTotal = updatedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
                                  onOrderUpdate(order.id, { items: updatedItems, total: newTotal });
                                }}
                                className="h-8 text-xs"
                                placeholder="500г"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs">Цена</Label>
                              <Input
                                type="number"
                                value={item.product.price}
                                onChange={(e) => {
                                  const newPrice = Number(e.target.value);
                                  const updatedItems = [...order.items];
                                  updatedItems[idx] = { 
                                    ...item, 
                                    product: { ...item.product, price: newPrice }
                                  };
                                  const newTotal = updatedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
                                  onOrderUpdate(order.id, { items: updatedItems, total: newTotal });
                                }}
                                className="h-8 text-xs"
                                placeholder="Цена"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs">Кол-во</Label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = Number(e.target.value);
                                  const updatedItems = [...order.items];
                                  updatedItems[idx] = { ...item, quantity: newQuantity };
                                  const newTotal = updatedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
                                  onOrderUpdate(order.id, { items: updatedItems, total: newTotal });
                                }}
                                className="h-8 text-xs text-center"
                                min="1"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <div className="text-xs">
                              <div className="text-muted-foreground">
                                {item.product.weight} × {item.quantity} шт
                              </div>
                              {parseWeight(item.product.weight) !== parseWeight(originalWeight) && (
                                <div className="text-orange-600 font-medium flex items-center gap-1 mt-1">
                                  <Icon name="Calculator" size={12} />
                                  Пересчитано с {originalWeight}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-primary text-lg">
                                {item.product.price * item.quantity} ₽
                              </div>
                              {item.product.price !== originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">
                                  {originalPrice * item.quantity} ₽
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Итого:</span>
                    <span>{order.total} ₽</span>
                  </div>
                  <div className="border-t pt-3 flex gap-2">
                    <Select value={order.status} onValueChange={(value) => onOrderUpdate(order.id, { status: value as any })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Новый</SelectItem>
                        <SelectItem value="preparing">Готовится</SelectItem>
                        <SelectItem value="ready">Готов</SelectItem>
                        <SelectItem value="completed">Завершён</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="icon" onClick={() => onOrderDelete(order.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
