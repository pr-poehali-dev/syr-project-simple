import { useEffect } from 'react';
import { Product, products as initialProducts } from '@/components/types';

type Order = {
  id: number;
  date: Date;
};

export function useDataLoader(
  setProducts: (products: Product[]) => void,
  setOrders: (orders: Order[]) => void,
  setSiteSettings: (settings: any) => void
) {
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

    const loadOrders = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/20ab4828-3a5a-440b-a3f7-ac65b2f84748');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.map((o: any) => ({ ...o, date: new Date(o.date) })));
        }
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      }
    };
    
    loadSettings();
    loadProducts();
    loadOrders();
    
    const interval = setInterval(loadSettings, 10000);
    const productsInterval = setInterval(loadProducts, 5000);
    const ordersInterval = setInterval(loadOrders, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(productsInterval);
      clearInterval(ordersInterval);
    };
  }, [setProducts, setOrders, setSiteSettings]);
}
