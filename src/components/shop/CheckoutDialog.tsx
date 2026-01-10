import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CartItem, Product } from '@/components/types';

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

type CheckoutDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  deliveryType: string;
  orderForm: {
    fullName: string;
    phone: string;
    address: string;
    comment: string;
  };
  setOrderForm: (form: any) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  setCart: (cart: CartItem[]) => void;
  customerEmail?: string;
};

export default function CheckoutDialog({
  isOpen,
  setIsOpen,
  cart,
  cartTotal,
  deliveryType,
  orderForm,
  setOrderForm,
  orders,
  setOrders,
  setCart,
  customerEmail
}: CheckoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading">Оформление заказа</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
                date: new Date(),
                customerEmail: customerEmail
              };

              setOrders([...orders, newOrder]);

              const chatIds = ['6368037525', '295345720'];
              
              try {
                for (const chatId of chatIds) {
                  await fetch('https://functions.poehali.dev/b94615ae-f896-4593-b92c-4cab4c6e7b41', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      botToken: '8530330128:AAH7zYq7jWo-TdGIZStP3AMDL5s_-Jzbkcg',
                      chatId,
                      orderData
                    })
                  });
                }
              } catch (error) {
                console.error('Ошибка отправки уведомления:', error);
              }

              alert('Заказ оформлен! Мы свяжемся с вами в ближайшее время.');
              setIsOpen(false);
              setOrderForm({ fullName: '', phone: '', address: '', comment: '' });
              setCart([]);
            }}
          >
            Подтвердить заказ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}