import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Product } from './types';
import SiteSettings from './SiteSettings';
import DomainSetup from './DomainSetup';
import AdminProductsTab from './admin/AdminProductsTab';
import AdminOrdersTab from './admin/AdminOrdersTab';
import AdminSummaryTab from './admin/AdminSummaryTab';
import AdminDialogs from './admin/AdminDialogs';

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
          <TabsList className="grid w-full grid-cols-5 max-w-4xl">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="summary">Сводка</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
            <TabsTrigger value="domain">Домен</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProductsTab
              products={products}
              onAddClick={() => setIsAddProductOpen(true)}
              onEditClick={setEditingProduct}
              onDeleteClick={onProductDelete}
            />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab
              orders={orders}
              onOrderUpdate={onOrderUpdate}
              onOrderDelete={onOrderDelete}
            />
          </TabsContent>

          <TabsContent value="summary">
            <AdminSummaryTab orders={orders} />
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

          <TabsContent value="domain">
            <h2 className="text-2xl font-heading font-bold mb-6">Настройка домена</h2>
            <DomainSetup />
          </TabsContent>
        </Tabs>
      </main>

      <AdminDialogs
        isAddProductOpen={isAddProductOpen}
        setIsAddProductOpen={setIsAddProductOpen}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        handleUpdateProduct={handleUpdateProduct}
      />
    </div>
  );
}
