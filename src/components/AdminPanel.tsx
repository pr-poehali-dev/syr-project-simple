import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Product, ProductVariant } from './types';
import SiteSettings from './SiteSettings';
import ProductVariantsManager from './ProductVariantsManager';

type Order = {
  id: number;
  customerName: string;
  items: { product: Product; quantity: number }[];
  total: number;
  deliveryType: string;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  date: Date;
};

type AdminPanelProps = {
  products: Product[];
  orders: Order[];
  onProductAdd: (product: Omit<Product, 'id'>) => void;
  onProductUpdate: (id: number, product: Partial<Product>) => void;
  onProductDelete: (id: number) => void;
  onOrderUpdate: (id: number, updates: Partial<Order>) => void;
  onOrderDelete: (id: number) => void;
  onSettingsUpdate?: (settings: any) => void;
  onLogout: () => void;
};

export default function AdminPanel({ products, orders, onProductAdd, onProductUpdate, onProductDelete, onOrderUpdate, onOrderDelete, onSettingsUpdate, onLogout }: AdminPanelProps) {

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    weight: '',
    image: '',
    category: 'cheese',
    stock: 0,
    variants: []
  });

  const [siteSettings, setSiteSettings] = useState({
    logo: '🧀',
    theme: 'default',
    minDeliveryAmount: 2500,
    siteDescription: 'Сыроварня SOBKO — натуральные продукты с любовью и заботой о вашем здоровье!',
    telegramBotToken: '8530330128:AAH7zYq7jWo-TdGIZStP3AMDL5s_-Jzbkcg',
    telegramChatId: '6368037525, 295345720',
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
    loadSettings();
  }, []);

  const handleAddProduct = () => {
    onProductAdd(newProduct);
    setNewProduct({
      name: '',
      price: 0,
      weight: '',
      image: '',
      category: 'cheese',
      stock: 0,
      variants: []
    });
    setIsAddProductOpen(false);
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      onProductUpdate(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const getTotalProductNeeds = () => {
    const totals: Record<string, { name: string; quantity: number }> = {};
    
    orders.forEach(order => {
      if (order.status === 'new' || order.status === 'preparing') {
        order.items.forEach(item => {
          if (!totals[item.product.id]) {
            totals[item.product.id] = {
              name: item.product.name,
              quantity: 0
            };
          }
          totals[item.product.id].quantity += item.quantity;
        });
      }
    });

    return Object.values(totals);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={24} />
              <h1 className="text-xl font-heading font-bold">Админ-панель</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onLogout}>
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
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="summary">Сводка</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-heading font-bold">Управление товарами</h2>
              <Button onClick={() => setIsAddProductOpen(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить товар
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.price} ₽ • {product.weight} • В наличии: {product.stock}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="flex-1"
                      >
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onProductDelete(product.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Заказы клиентов</h2>
            <div className="space-y-4">
              {orders.map(order => (
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
                        <p className="text-sm font-semibold mb-2">Состав заказа:</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm py-2 border-b last:border-0 gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  type="text"
                                  value={item.product.weight}
                                  onChange={(e) => {
                                    const updatedItems = [...order.items];
                                    updatedItems[idx] = { 
                                      ...item, 
                                      product: { ...item.product, weight: e.target.value }
                                    };
                                    const newTotal = updatedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
                                    onOrderUpdate(order.id, { items: updatedItems, total: newTotal });
                                  }}
                                  className="w-20 h-7 text-xs"
                                  placeholder="500 г"
                                />
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
                                  className="w-20 h-7 text-xs"
                                  placeholder="Цена"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                className="w-16 h-8 text-center"
                                min="1"
                              />
                              <span className="text-xs">×</span>
                              <span className="font-medium min-w-[60px] text-right">{item.product.price * item.quantity} ₽</span>
                            </div>
                          </div>
                        ))}
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Сводная таблица производства</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Общее количество товаров для приготовления по активным заказам
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTotalProductNeeds().map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right text-lg font-bold text-primary">
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <h2 className="text-2xl font-heading font-bold mb-6">Настройки сайта</h2>
            <SiteSettings
              settings={siteSettings}
              onSave={(newSettings) => {
                setSiteSettings(newSettings);
                if (onSettingsUpdate) {
                  onSettingsUpdate(newSettings);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-heading">Добавить товар</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="name">Название товара</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Вес/объем</Label>
                <Input
                  id="weight"
                  value={newProduct.weight}
                  onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                  placeholder="300г"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheese">Сыры</SelectItem>
                  <SelectItem value="dairy">Молочное</SelectItem>
                  <SelectItem value="meat">Мясо</SelectItem>
                  <SelectItem value="desserts">Десерты</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Количество в наличии</Label>
              <Input
                id="stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Изображение товара</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNewProduct({ ...newProduct, image: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {newProduct.image && (
                <img src={newProduct.image} alt="Предпросмотр" className="w-full h-32 object-cover rounded-md mt-2" />
              )}
            </div>
            <ProductVariantsManager
              variants={newProduct.variants || []}
              onChange={(variants) => setNewProduct({ ...newProduct, variants })}
            />
            <Button onClick={handleAddProduct} className="w-full">
              Добавить товар
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-heading">Редактировать товар</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название товара</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Цена (₽)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Вес/объем</Label>
                  <Input
                    id="edit-weight"
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Количество в наличии</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Изображение товара</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditingProduct({ ...editingProduct, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {editingProduct.image && (
                  <img src={editingProduct.image} alt="Предпросмотр" className="w-full h-32 object-cover rounded-md mt-2" />
                )}
              </div>
              <ProductVariantsManager
                variants={editingProduct.variants || []}
                onChange={(variants) => setEditingProduct({ ...editingProduct, variants })}
              />
              <Button onClick={handleUpdateProduct} className="w-full">
                Сохранить изменения
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}